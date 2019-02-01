/* global google*/
import React, { Component } from "react";
import Geocode from "react-geocode";
const _ = require("lodash");
const { compose, withProps, lifecycle } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline
} = require("react-google-maps");
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");



const MapWithAMarker = compose(
  
  withScriptjs, withGoogleMap, 
  lifecycle({
    componentWillMount() {
      const refs = {}
      this.setState({
        bounds: null,
        center: {
          lat: 41.9, lng: -87.624
        },
        nexttMarkers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          })
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();

          
          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
            id: place.id,
            name: place.formatted_address,
          }));
          console.log(this.state.nextMarkers)
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
          this.state.nexttMarkers = nextMarkers.concat(this.state.nexttMarkers)
          console.log(this.state.nexttMarkers)
          this.setState({
            center: nextCenter,
            markers: this.state.nexttMarkers,
          });
           refs.map.fitBounds(bounds);
        },
        onRemoveMarker: id => {
          this.setState(state => {
            const nexttMarkers = state.nexttMarkers.filter(marker => marker.id !== id);
            return {
              nexttMarkers,
            };
          });
        },

        onMarkerDragEnd: ( id, e ) => {
          var geocoder = new google.maps.Geocoder();
           let newLat = e.latLng.lat(),
             newLng = e.latLng.lng();
          //let position = e.latLng.toString();
            var latlng = { lat: parseFloat(newLat), lng: parseFloat(newLng)};
              const index = this.state.markers.findIndex((marker) => {
                return marker.id === id
              });
              const marker = Object.assign({}, this.state.nexttMarkers[index]);
              const markerss = Object.assign([], this.state.nexttMarkers);
              geocoder.geocode({ 'location': latlng}, (results, status ) => {
                if (status === 'OK') {
                  if (results[0]) {
                    marker.position = new google.maps.LatLng(newLat, newLng);
                    marker.name = results[0].formatted_address;
                    markerss[index] = marker;
                    console.log(markerss[index])
                    this.setState({
                      nexttMarkers: markerss
                    })
                  } else {
                    window.alert('No results found');
                  }
                }
              })

              // marker.position = new google.maps.LatLng(newLat, newLng)

              // console.log(marker)
              // const markerss = Object.assign([], this.state.markers);
              // console.log(markerss[index].position.lat())
              // markerss[index] = marker;
              // console.log(markerss[index].position.lat())
              // this.setState({
              //   markers: markerss
              // } )
        },
      },
      )
    },
  }),
  )(props => {
  return (
    <div>
    <GoogleMap 
    defaultZoom={7}
    defaultCenter={{ lat: 29.5, lng: -95 }}
    ref={props.onMapMounted}
    onClick={props.onMapClicked}
    onBoundsChanged={props.onBoundsChanged}
    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&libraries=places"
    >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Customized your placeholder"
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `240px`,
          height: `32px`,
          marginTop: `27px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`,
        }}
      />
    </SearchBox>
      {/* {props.markers.map(marker => {
        const onClick = props.onClick.bind(this, marker)
        return (
          <Marker
            ref={props.onMarkerMounted}
            key={marker.id}
            onClick={onClick}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          >
          </Marker>
        )
      })} */}
      {props.nexttMarkers.map((marker, index) =>
      {
        const onClick = props.onClick.bind(this, marker)
        return (
          <Marker
            ref={props.onMarkerMounted}
            key={marker.id}
            onClick={onClick}
            position={marker.position}
            draggable={true}
            onDragEnd={ (e) => props.onMarkerDragEnd(marker.id, e) }
          >
          </Marker>
        )
      }
      // <Marker key={index} position={marker.position} />
    )}
    </GoogleMap>
    <Polyline path={props.nexttMarkers.map((marker) => (
      {lat: marker.position.lat(), lng:marker.position.lng()}
    ))}/>
    <Polyline path={[{ lat: -34.397, lng: 150.644 }, { lat: -35.397, lng: 151.644 }]}/>
    {props.nexttMarkers.map((marker, index) => (
          <li>
          <ul>{marker.name}</ul>
          <button
          type="button"
          onClick={(index) => props.onRemoveMarker(marker.id)}
        >
          Remove
        </button>
        </li>
        ))}
    </div>
  )
})

export default class ShelterMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapApiLoaded: false,
      mapInstance: null,
      mapApi: null,
      value: '',
      markers: [],
      selectedMarker: false
    }

    this.onMarkerMounted = element => {
      this.setState(prevState => ({
        markerObjects: [...prevState.markerObjects, element.marker]
      }))
    };
  }

  onChangeValue = event => {
    this.setState({ value: event.target.value });
  };

  onAddMarker = () => {
    // not allowed AND not working
    this.setState(state => {
      const markers = state.markers.push(state.value);
      return {
        markers,
        value: '',
      };
    });
  };

  onRemoveMarker = id => {
    this.setState(state => {
      const markers = state.markers.filter(shelters => shelters.id !== id);
      return {
        markers,
      };
    });
  };


  // componentDidMount() {
  //   fetch("https://api.harveyneeds.org/api/v1/shelters?limit=20")
  //     .then(r => r.json())
  //     .then(data => {
  //       this.setState({ markers: data.shelters })
  //     })
  // }

  handleClick = (marker, event) => {
    // console.log({ marker })
    this.setState({ selectedMarker: marker })
  }

  // apiHasLoaded = (map, maps) => {
  //   this.setState({
  //     mapApiLoaded: true,
  //     mapInstance: map,
  //     mapApi: maps,
  //   });
  // };

  addPlace = (place) => {
    this.setState({ places: place });
  };

  onMapClicked = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  addMarker = (mapProps, map) => {
    var marker = new google.maps.Marker({
      position: {},
      map: map
    });
  };
  

  render() {
    // const { mapInstance, mapApi,
    // } = this.state;
    return (
      <div>
      {/* <SearchBox map={mapInstance} mapApi={mapApi} addplace={this.addPlace} /> */}
      <MapWithAMarker
        selectedMarker={this.state.selectedMarker}
        markers={this.state.markers}
        onClick={this.handleClick}
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&libraries=places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
        {this.state.markers.map((place) => (
          <li>
          <ul key={place.id}>{place.address_components.short_name}</ul>
          <button
          type="button"
          
          onClick={() => this.onRemoveMarker(place.id)}
        >
          Remove
        </button>
        </li>
        ))}
      
      </div>
    )
  }
}