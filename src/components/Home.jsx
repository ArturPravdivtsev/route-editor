import React, { Component } from 'react';
import Map from './Map.jsx';

class Home extends Component {

    render() {
        return ( 
        <div style = {{ margin: '100px' } } >
            <Map google = { this.props.google }
            center = {{ lat: 51.7119242, lng: 36.0421978 } }
            height = '300px'
            zoom = { 15 }
            />
            </div>
        );
    }
}

export default Home;