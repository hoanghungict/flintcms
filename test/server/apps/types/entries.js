const mocks = require('../../../mocks');
const expect = require('expect');
const common = require('../common');

it('returns a list of entries', (done) => {
  global.agent
    .post('/graphql')
    .send({
      query: `
      {
        entries {
          _id
          title
        }
      }`,
    })
    .end((err, res) => {
      if (err) { return done(err); }
      expect(JSON.parse(res.text)).toEqual({
        data: {
          entries: [
            { _id: mocks.entries[0]._id, title: mocks.entries[0].title },
            { _id: mocks.entries[1]._id, title: mocks.entries[1].title },
            { _id: mocks.entries[2]._id, title: mocks.entries[2].title },
            { _id: mocks.entries[3]._id, title: mocks.entries[3].title },
          ],
        },
      });
      return done();
    });
});

it('can query for a specific entry by _id', function (done) {
  global.agent
    .post('/graphql')
    .send({
      query: `
      query ($_id: ID!) {
        entry (_id: $_id) {
          _id
        }
      }`,
      variables: { _id: mocks.entries[1]._id },
    })
    .end((err, res) => {
      if (err) { return done(err); }
      expect(JSON.parse(res.text)).toEqual({
        data: {
          entry: { _id: mocks.entries[1]._id },
        },
      });
      return done();
    });
});

it('can delete an entry from the database', function (done) {
  global.agent
    .post('/graphql')
    .send({
      query: `
      mutation ($_id: ID!) {
        removeEntry (_id: $_id) {
          _id
        }
      }`,
      variables: { _id: mocks.entries[1]._id },
    })
    .end((err, res) => {
      if (err) { return done(err); }
      expect(JSON.parse(res.text)).toEqual({
        data: {
          removeEntry: { _id: mocks.entries[1]._id },
        },
      });
      return done();
    });
});

it('can save an entry to the database', function (done) {
  global.agent
    .post('/graphql')
    .send({
      query: `
      mutation ($data: EntriesInput!) {
        addEntry (data: $data) {
          title
        }
      }`,
      variables: {
        data: {
          title: mocks.entries[1].title,
          status: mocks.entries[1].status,
          author: mocks.users[0]._id,
          section: mocks.sections[0]._id,
          fields: [{
            fieldId: mocks.fields[0]._id,
            handle: mocks.fields[0].handle,
            value: 'Hello!',
          }],
        },
      },
    })
    .end((err, res) => {
      if (err) { return done(err); }
      expect(JSON.parse(res.text)).toEqual({
        data: {
          addEntry: {
            title: mocks.entries[1].title,
          },
        },
      });
      return done();
    });
});

it('can update an entry in the database', function (done) {
  global.agent
    .post('/graphql')
    .send({
      query: `
      mutation ($_id: ID!, $data: EntriesInput!) {
        updateEntry (_id: $_id, data: $data) {
          title
        }
      }`,
      variables: {
        _id: mocks.entries[0]._id,
        data: {
          title: 'New title!',
          author: mocks.users[0]._id,
          section: mocks.sections[0]._id,
          fields: [{
            fieldId: mocks.fields[0]._id,
            handle: mocks.fields[0].handle,
            value: 'Hello!',
          }],
        },
      },
    })
    .end((err, res) => {
      if (err) { return done(err); }
      expect(JSON.parse(res.text)).toEqual({
        data: {
          updateEntry: {
            title: 'New title!',
          },
        },
      });
      return done();
    });
});

describe('Permissions', function () {
  before('Set to non-admin', common.setNonAdmin);

  it('throws when user is not allowed to add a new entry', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `mutation ($data: EntriesInput!) {
          addEntry (data: $data) {
            title
          }
        }`,
        variables: {
          data: {
            title: 'This should not work',
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(JSON.parse(res.text).errors[0]).toInclude({
          message: 'You do not have permission to create new Entries',
        });
        return done();
      });
  });

  it('throws when user is not allowed to update an entry\'s status', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `mutation ($_id: ID!, $data: EntriesInput!) {
          updateEntry (_id: $_id, data: $data) {
            title
          }
        }`,
        variables: {
          _id: mocks.entries[0]._id,
          data: {
            title: mocks.entries[0].title,
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            status: mocks.entries[0].status,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(JSON.parse(res.text).errors[0]).toInclude({
          message: 'You are not allowed to change the status of entries. Sorry!',
        });
        return done();
      });
  });

  it('throws when user edits an entry not their own', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `mutation ($_id: ID!, $data: EntriesInput!) {
          updateEntry (_id: $_id, data: $data) {
            title
          }
        }`,
        variables: {
          _id: mocks.entries[2]._id,
          data: {
            title: mocks.entries[2].title,
            author: mocks.users[1]._id,
            section: mocks.entries[2].section,
            status: 'live',
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(JSON.parse(res.text).errors[0]).toInclude({
          message: 'You are not allowed to edit this entry. Sorry!',
        });
        return done();
      });
  });

  it('throws when user edits a live entry', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `mutation ($_id: ID!, $data: EntriesInput!) {
          updateEntry (_id: $_id, data: $data) {
            title
          }
        }`,
        variables: {
          _id: mocks.entries[3]._id,
          data: {
            title: 'A title!',
            author: mocks.users[0]._id,
            section: mocks.entries[3].section,
            status: mocks.entries[3].status,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(JSON.parse(res.text).errors[0]).toInclude({
          message: 'You are not allowed to edit a live entry. Sorry!',
        });
        return done();
      });
  });

  it('does not return a draft entry', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `{
          entries {
            status
          }
        }`,
      })
      .end((err, res) => {
        if (err) { return done(err); }
        const data = JSON.parse(res.text).data.entries;
        expect(data).toExclude({ status: 'draft' });
        expect(data).toExclude({ status: 'disabled' });
        expect(data).toInclude({ status: 'live' });
        return done();
      });
  });

  it('throws when deleting an entry', function (done) {
    global.agent
      .post('/graphql')
      .send({
        query: `mutation removeEntry ($_id: ID!) {
          removeEntry (_id: $_id) {
            _id
          }
        }`,
        variables: { _id: mocks.entries[0]._id },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        const data = JSON.parse(res.text);
        expect(data.errors[0]).toInclude({ message: 'You do not have permission to delete Entries' });
        return done();
      });
  });

  after('Set to admin', common.setAdmin);
});