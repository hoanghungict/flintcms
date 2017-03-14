import React, { Component, PropTypes } from 'react';
import StatusDot from '../../components/StatusDot';
import Dropdown, { DropdownChild } from '../../components/Fields/Dropdown';
import './Aside.scss';

export default class Aside extends Component {
  static propTypes = {
    status: PropTypes.oneOf(['live', 'draft', 'disabled']),
  }

  static defaultProps = {
    status: 'draft',
  }

  constructor(props) {
    super(props);
    this.state = { status: props.status };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ status: newProps.status });
  }

  render() {
    const { status } = this.state;

    return (
      <aside className="aside">
        <Dropdown
          name="status"
          label="Status"
          full
          defaultValue={status}
          onChange={s => this.setState({ status: s })}
          options={[
            { label: 'Live', component: <DropdownChild>Live<StatusDot status="live" /></DropdownChild>, value: 'live' },
            { label: 'Draft', component: <DropdownChild>Draft<StatusDot status="draft" /></DropdownChild>, value: 'draft' },
            { label: 'Disabled', component: <DropdownChild>Disabled<StatusDot status="disabled" /></DropdownChild>, value: 'disabled' },
          ]}
        >
          <StatusDot status={this.state.status} />
        </Dropdown>
      </aside>
    );
  }
}