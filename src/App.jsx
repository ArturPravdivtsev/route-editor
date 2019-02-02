/* global google*/
import React, { Component,Fragment } from "react";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
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

const SortableItem = sortableElement(({value}) => <li>{value}</li>);
const SortableContainer = sortableContainer(({children}) => {
  return <ul>{children}</ul>;
});

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
        selectedMarker: false,
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
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
          this.state.nexttMarkers = this.state.nexttMarkers.concat(nextMarkers)
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
        },

        onSortEnd: ({oldIndex, newIndex}) => {
          const markerss = Object.assign([], this.state.nexttMarkers);
          const tmp = markerss[oldIndex];
          markerss[oldIndex] = markerss[newIndex];
          markerss[newIndex] = tmp;
          this.setState({
            nexttMarkers: markerss,
          });
        },

         onClick: (marker, event) => {
          this.setState({ selectedMarker: marker })
        }
      },
      )
    },
  }),
  )(props => {
  return (
    <div>
    <GoogleMap 
    selectedMarker={props.selectedMarker}
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
            {props.selectedMarker === marker &&
              <InfoWindow>
                <div>
                  {marker.name}
                </div>
              </InfoWindow>
            }
          </Marker>
        )
      }
    )}
    </GoogleMap>
    <Polyline path={props.nexttMarkers.map((marker) => (
      {lat: marker.position.lat(), lng:marker.position.lng()}
    ))}/>
    <Polyline path={[{ lat: -34.397, lng: 150.644 }, { lat: -35.397, lng: 151.644 }]}/>
    <SortableContainer onSortEnd={props.onSortEnd}>
        {props.nexttMarkers.map((marker, index) => (
          <Fragment>
          <SortableItem key={`item-${index}`} index={index} value={marker.name} />
          <button
          type="button"
          onClick={(index) => props.onRemoveMarker(marker.id)}
        >
          Remove
        </button>
        </Fragment>
        ))}
      </SortableContainer>
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
  }

  // handleClick = (marker, event) => {
  //   this.setState({ selectedMarker: marker })
  // }

  render() {
    return (
      <div>
      <MapWithAMarker
        selectedMarker={this.state.selectedMarker}
        markers={this.state.markers}
        //onClick={this.handleClick}
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&libraries=places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />      
      </div>
    )
  }
}