/* global google*/
import React, { Component,Fragment } from "react";
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import { Icon, Button } from "@blueprintjs/core";
import "./App.css";
const { compose, lifecycle } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline
} = require("react-google-maps");

export const SortableItem = sortableElement(({value}) => <li class="noselect"><Icon className="icon" icon="drag-handle-horizontal" iconSize={30} />{value.name}</li>);
export const SortableContainer = sortableContainer(({children}) => {
  return <ul>{children}</ul>;
});

export const MapWithAMarker = compose(
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
        inputText: '',
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
                    //marker.name = results[0].formatted_address;
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
           if(this.state.selectedMarker){
            this.setState({ selectedMarker: false })
           } else
          this.setState({ selectedMarker: marker })
        },

        handleInputChange: ({ target: { value } }) => {
          this.setState({
            inputText: value,
          })
        },

        onKeyPress: (e, index) => {
          if(e.key === 'Enter'){
            const place = this.state.inputText;

            const nextMarkers = ({
              position: this.state.center,
              id: this.state.center+place,
              name: place,
            });
            const nextCenter = this.state.center;
            this.state.nexttMarkers = this.state.nexttMarkers.concat(nextMarkers)
            this.setState({
              center: nextCenter,
              markers: this.state.nexttMarkers,
            });
          }
        }
      },
      )
    },
  }),
  )(props => {
  return (
    <Fragment>
      <input type="text" 
              name="marker" 
              value={props.inputText} 
              onChange={props.handleInputChange} 
              onKeyPress={props.onKeyPress}
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
          <GoogleMap 
            selectedMarker={false}
            defaultZoom={7}
            defaultCenter={{ lat: 29.5, lng: -95 }}
            ref={props.onMapMounted}
            onClick={props.onMapClicked}
            onBoundsChanged={props.onBoundsChanged}
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&libraries=places"
          >
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
    <SortableContainer onSortEnd={props.onSortEnd}>
        {props.nexttMarkers.map((marker, index) => (
          <div class="row">
          <SortableItem key={`item-${index}`} index={index} value={marker} />
          <Button
            icon="delete"
            onClick={(index) => props.onRemoveMarker(marker.id)}
          ></Button>
          </div>
        ))}
          </SortableContainer>
    </Fragment>
  )
})

export default class RouteEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
    }
  }

  render() {
    return (
      <div>
      <MapWithAMarker
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDGe5vjL8wBmilLzoJ0jNIwe9SAuH2xS_0&libraries=places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `300px`, width: `100%` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />      
      </div>
    )
  }
}