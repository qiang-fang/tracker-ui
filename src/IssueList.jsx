import React from 'react';
import URLSearchParams from 'url-search-params';
// import { Route } from 'react-router-dom';
// import { Label } from 'react-bootstrap';
import { Panel, Pagination, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
// import IssueAdd from './IssueAdd.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
// import Toast from './Toast.jsx';
import withToast from './withToast.jsx';
import store from './store.js';

const SECTION_SIZE = 5;

function PageLink({
  params, page, activePage, children,
}) {
  params.set('page', page);
  if (page === 0) return React.cloneElement(children, { disabled: true });
  return (
    <LinkContainer
      isActive={() => page === activePage}
      to={{ search: `?${params.toString()}` }}
    >
      {children}
    </LinkContainer>
  );
}

class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get('status')) vars.status = params.get('status');
    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const { params: { id } } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }

    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const query = `query issueList(
      $status: StatusType
      $effortMin: Int
      $effortMax: Int
      $hasSelection: Boolean!
      $selectedId: Int!
      $page: Int
    ) {
      issueList(
        status: $status
        effortMin: $effortMin
        effortMax: $effortMax
        page: $page
      ) {
        issues {
          id title status owner
          created effort due
        }
        pages
      }
      issue(id: $selectedId) @include (if : $hasSelection) {
        id description
      }
    }`;
    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor() {
    super();
    // const issues = store.initialData ? store.initialData.issueList.issues : null;
    // const selectedIssue = store.initialData
    //   ? store.initialData.issue
    //   : null;
    const initialData = store.initialData || { issueList: {} };
    const {
      issueList: { issues, pages }, issue: selectedIssue,
    } = initialData;
    delete store.initialData;
    this.state = {
      issues,
      selectedIssue,
      pages,
      // toastVisible: false,
      // toastMessage: ' ',
      // toastType: 'info',
    };
    // this.createIssue = this.createIssue.bind(this);
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    // this.showSuccess = this.showSuccess.bind(this);
    // this.showError = this.showError.bind(this);
    // this.dismissToast = this.dismissToast.bind(this);
  }

  // This method is called as soon as the IssueList component’s representation has been
  // converted and inserted into the DOM
  componentDidMount() {
    const { issues } = this.state;
    if (issues == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    // const { location: { search: prevSearch } } = prevProps;
    const {
      location: { search: prevSearch },
      match: { params: { id: prevId } },
    } = prevProps;
    const { location: { search }, match: { params: { id } } } = this.props;
    if (prevSearch !== search || prevId !== id) {
      this.loadData();
    }
  }

  // will replace this with an API call to the server
  async loadData() {
    const { location: { search }, match, showError } = this.props;
    const data = await IssueList.fetchData(match, search, showError);
    if (data) {
      this.setState({
        issues: data.issueList.issues,
        selectedIssue: data.issue,
        pages: data.issueList.pages,
      });
    }
  }

  async closeIssue(index) {
    const query = `mutation issueClose($id: Int!) {
      issueUpdate(id: $id, changes: { status: Closed }) {
        id title status owner
        effort created due description
      }
    }`;
    const { issues } = this.state;
    const { showError } = this.props;
    const data = await graphQLFetch(query, { id: issues[index].id }, showError);
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        newList[index] = data.issueUpdate;
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(index) {
    const query = `mutation issueDelete($id: Int!) {
    issueDelete(id: $id)
    }`;
    const { showSuccess, showError } = this.props;
    const { issues } = this.state;
    const { location: { pathname, search }, history } = this.props;
    const { id } = issues[index];
    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.issueDelete) {
      // showSuccess(`Deleted issue ${id} successfully.`);
      const undoMessage = (
        <span>
          {`Deleted issue ${id} successfully.`}
          <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
            UNDO
          </Button>
        </span>
      );
      showSuccess(undoMessage);
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        if (pathname === `/issues/${id}`) {
          history.push({ pathname: '/issues', search });
        }
        newList.splice(index, 1);
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async restoreIssue(id) {
    const query = `mutation issueRestore($id: Int!) {
    issueRestore(id: $id)
    }`;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      showSuccess(`Issue ${id} restored successfully.`);
      this.loadData();
    }
  }

  render() {
    const { issues } = this.state;
    if (issues == null) return null;
    // const { match } = this.props;
    // const { selectedIssue } = this.state;
    // const { toastVisible, toastType, toastMessage } = this.state;
    const { selectedIssue, pages } = this.state;
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;
    const startPage = Math.floor((page - 1) / SECTION_SIZE) * SECTION_SIZE + 1;
    const endPage = startPage + SECTION_SIZE - 1;
    const prevSection = startPage === 1 ? 0 : startPage - SECTION_SIZE;
    const nextSection = endPage >= pages ? 0 : startPage + SECTION_SIZE;
    const items = [];
    for (let i = startPage; i <= Math.min(endPage, pages); i += 1) {
      params.set('page', i);
      items.push((
        <PageLink key={i} params={params} activePage={page} page={i}>
          <Pagination.Item>{i}</Pagination.Item>
        </PageLink>
      ));
    }
    return (
      <React.Fragment>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter urlBase="/issues" />
          </Panel.Body>
        </Panel>
        {/* <h1><Label>Issue Tracker</Label></h1> */}
        {/* <IssueFilter /> */}
        {/* <hr /> */}
        <IssueTable
          issues={issues}
          closeIssue={this.closeIssue}
          deleteIssue={this.deleteIssue}
        />
        {/* <hr /> */}
        {/* <IssueAdd createIssue={this.createIssue} /> */}
        {/* <hr /> */}
        {/* <Route path={`${match.path}/:id`} component={IssueDetail} /> */}
        <IssueDetail issue={selectedIssue} />
        {/* <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast> */}
        <Pagination>
          <PageLink params={params} page={prevSection}>
            <Pagination.Item>{'<'}</Pagination.Item>
          </PageLink>
          {items}
          <PageLink params={params} page={nextSection}>
            <Pagination.Item>{'>'}</Pagination.Item>
          </PageLink>
        </Pagination>
      </React.Fragment>
    );
  }
}

const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;
export default IssueListWithToast;
