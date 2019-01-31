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
  InfoWindow
} = require("react-google-maps");
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");

const MapWithAMarker = compose(
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
          }));
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
          this.state.nexttMarkers = nextMarkers.concat(this.state.nexttMarkers)
          this.setState({
            center: nextCenter,
            markers: this.state.nexttMarkers,
          });
           refs.map.fitBounds(bounds);
        },
        onRemoveMarker: id => {
          this.setState(state => {
            const markers = state.markers.filter(marker => marker.id !== id);
            return {
              markers,
            };
          });
        },

        /* @param event */

        onMarkerDragEnd: ( id, e ) => {
           let newLat = e.latLng.lat(),
             newLng = e.latLng.lng();
          //let position = e.latLng.toString();
            //console.log(position)
              const index = this.state.markers.findIndex((marker) => {
                return marker.id === id
              });
              //console.log(index)
              const marker = Object.assign({}, this.state.markers[index]);
              //console.log(marker.position.lat())
              //marker.position = position;
              marker.position = new google.maps.LatLng(newLat, newLng)
              console.log(marker)
              const markers = Object.assign([], this.state.markers);
              console.log(markers[index])
              markers[index] = marker;
              console.log(markers[index])
              this.setState({
                markers: markers
              } )
        },
      },
      )
    },
  }),
  withScriptjs, withGoogleMap)(props => {
  return (
    <div>
    <GoogleMap 
    defaultZoom={10} 
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
      {props.markers.map((marker, index) =>
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
    {props.markers.map((marker, index) => (
          <li>
          <ul>{marker.position.lat()}</ul>
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
    super(props)
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


// class MapContainer extends React.Component {
//   state = {
//     markers: [
//       {
//         name: "Current position",
//         position: {
//           lat: 37.77,
//           lng: -122.42
//         }
//       }
//     ]
//   };

//   onMarkerDragEnd = (coord, index) => {
//     const { latLng } = coord;
//     const lat = latLng.lat();
//     const lng = latLng.lng();

//     this.setState(prevState => {
//       const markers = [...this.state.markers];
//       markers[index] = { ...markers[index], position: { lat, lng } };
//       return { markers };
//     });
//   };

//   render() {
//     return (
//       <Map
//         google={this.props.google}
//         style={{
//           width: "100%",
//           height: "300px"
//         }}
//         zoom={14}
//       >
//         {this.state.markers.map((marker, index) => (
//           <Marker
//             position={marker.position}
//             draggable={true}
//             onDragend={(t, map, coord) => this.onMarkerDragEnd(coord, index)}
//             name={marker.name}
//           />
//         ))}
//       </Map>
//     );
//   }
// }



// /* global google */
// import React, { Component } from "react";
// const _ = require("lodash");
// const { compose, withProps, lifecycle } = require("recompose");
// const {
//   withScriptjs,
//   withGoogleMap,
//   GoogleMap,
//   Marker,
// } = require("react-google-maps");
// const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");

// const MapWithASearchBox = compose(
//   withProps({
//     googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&v=3.exp&libraries=geometry,drawing,places",
//     loadingElement: <div style={{ height: `100%` }} />,
//     containerElement: <div style={{ height: `400px` }} />,
//     mapElement: <div style={{ height: `100%` }} />,
//   }),
//   lifecycle({
//     componentWillMount() {
//       const refs = {}

//       this.setState({
//         bounds: null,
//         center: {
//           lat: 41.9, lng: -87.624
//         },
//         markers: [],
//         onMapMounted: ref => {
//           refs.map = ref;
//         },
//         onBoundsChanged: () => {
//           this.setState({
//             bounds: refs.map.getBounds(),
//             center: refs.map.getCenter(),
//           })
//         },
//         onSearchBoxMounted: ref => {
//           refs.searchBox = ref;
//         },
//         onPlacesChanged: () => {
//           const places = refs.searchBox.getPlaces();
//           const bounds = new google.maps.LatLngBounds();

//           places.forEach(place => {
//             if (place.geometry.viewport) {
//               bounds.union(place.geometry.viewport)
//             } else {
//               bounds.extend(place.geometry.location)
//             }
//           });
//           const nextMarkers = places.map(place => ({
//             position: place.geometry.location,
//           }));
//           const nextCenter = _.get(nextMarkers, '0.position', this.state.center);

//           this.setState({
//             center: nextCenter,
//             markers: nextMarkers,
//           });
//           // refs.map.fitBounds(bounds);
//         },
//       })
//     },
//   }),
//   withScriptjs,
//   withGoogleMap
// )(props =>
//   <GoogleMap
//     ref={props.onMapMounted}
//     defaultZoom={15}
//     center={props.center}
//     onBoundsChanged={props.onBoundsChanged}
//   >
//     <SearchBox
//       ref={props.onSearchBoxMounted}
//       bounds={props.bounds}
//       controlPosition={google.maps.ControlPosition.TOP_LEFT}
//       onPlacesChanged={props.onPlacesChanged}
//     >
//       <input
//         type="text"
//         placeholder="Customized your placeholder"
//         style={{
//           boxSizing: `border-box`,
//           border: `1px solid transparent`,
//           width: `240px`,
//           height: `32px`,
//           marginTop: `27px`,
//           padding: `0 12px`,
//           borderRadius: `3px`,
//           boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
//           fontSize: `14px`,
//           outline: `none`,
//           textOverflow: `ellipses`,
//         }}
//       />
//     </SearchBox>
//     {props.markers.map((marker, index) =>
//       <Marker key={index} position={marker.position} />
//     )}
//   </GoogleMap>
// );

// export default MapWithASearchBox;