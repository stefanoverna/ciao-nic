import tiny from 'tiny-json-http';

export async function request({ query, variables, preview }) {
  const endpoint = preview
    ? `https://graphql.datocms.com/preview`
    : `https://graphql.datocms.com/`;

  const { body } = await tiny.post({
    url: endpoint,
    headers: {
      authorization: `Bearer 2a368ab0134453224b632af0d9a702`,
    },
    data: {
      query,
      variables,
    },
  });

  if (body.errors) {
    console.error("Ouch! The query has some errors!");
    throw body.errors;
  }

  return body.data;
}