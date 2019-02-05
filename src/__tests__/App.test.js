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

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render( < App /> , div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders RouteEditor without crashing', () => {
  const wrapper = shallow(<RouteEditor />);
  expect(wrapper).toMatchSnapshot();
});

it('renders SortableItem without crashing', () => {
  const wrapper = shallow(<SortableItem />);
  expect(wrapper).toMatchSnapshot();
});

it('renders SortableContainer without crashing', () => {
  const wrapper = shallow(<SortableContainer />);
  expect(wrapper).toMatchSnapshot();
});

const markers = [
  { id: 1, name: 'Moscow'}
];

it('Render SortableContainer must contain 1 point', () => {
  const wrapper = mount(<SortableContainer nexttMarkers={markers} />);
  const listPoints = wrapper.find(SortableItem);
  expect(listPoints.length).toBe(1);
});
