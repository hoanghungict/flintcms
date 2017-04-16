/* eslint-disable react/no-array-index-key */

import React, { Component, PropTypes } from 'react';

export default class FieldOptions extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  }

  render() {
    const { fields, type } = this.props;
    return (
      <div>
        <h3>{type} Options</h3>
        {(fields[type].fields || []).map((F, i) => <F.type key={i} {...F} name={`options[${F.name}]`} />)}
      </div>
    );
  }
}