import React from 'react';
import PropTypes from 'prop-types';
import {
  Form, FormControl, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';

export default class IssueAdd extends React.Component {
  constructor() {
    super(); // constructor of parent class
    // setTimeout(() => {
    //     this.props.createIssue(sampleIssue);
    // },2000);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // receive event as argument
  handleSubmit(e) {
    e.preventDefault(); // why?
    const form = document.forms.issueAdd; // form handle? what's this meaning
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    };
    // this.props.createIssue(issue);
    const { createIssue } = this.props;
    createIssue(issue);
    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    return (
    // <div>This is a placeholder for a form to add an issue.</div>
    // rewrite the form declaration with a name and an onSubmit handler
      <Form inline name="issueAdd" onSubmit={this.handleSubmit}>
        {/* <input type="text" name="owner" placeholder="Owner" /> */}
        {/* <input type="text" name="title" placeholder="Title" /> */}
        {/* <button type="submit">Add</button> */}
        <FormGroup>
          <ControlLabel>Owner:</ControlLabel>
          {' '}
          <FormControl type="text" name="owner" />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Title:</ControlLabel>
          {' '}
          <FormControl type="text" name="title" />
        </FormGroup>
        {' '}
        <Button bsStyle="primary" type="submit">Add</Button>
      </Form>
    );
  }
}

IssueAdd.propTypes = {
  createIssue: PropTypes.func.isRequired,
};
