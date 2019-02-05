import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallowToJson } from 'enzyme-to-json';
import sinon from 'sinon';
import App from '../App';
import RouteEditor from '../App';
import SortableItem from '../App';
import SortableContainer from '../App';

const willMount = sinon.spy();

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render( < App /> , div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders RouteEditor without crashing', () => {
  shallow(<RouteEditor />);
});

it('renders SortableItem without crashing', () => {
  shallow(<SortableItem />);
});

it('renders SortableContainer without crashing', () => {
  shallow(<SortableContainer />);
});

