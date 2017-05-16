import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import faker from 'faker';

ReactDOM.render(
  <App user={faker.name.findName()} />,
  document.getElementById('root')
);
