import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

export default class Main extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };

  componentDidMount() {
    fetch('/admin/api/user', {
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then(res => res.json()).then((json) => {
      if (json.status === 401 && json.redirect) {
        browserHistory.push(json.redirect);
      } else {
        console.log(json);
      }
    });
  }

  render() {
    return (
      <div>
        Main!
        <div>
          {React.cloneElement(this.props.children, {
            ...this.props,
            key: this.props.location.pathname,
          })}
        </div>
      </div>
    );
  }
}
