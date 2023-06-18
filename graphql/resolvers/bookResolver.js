

const bookResolvers = {
    Query: {
      books: () => {
        const books = [
            {
            title: 'The Awakening',
            author: 'Kate Chopin',
            },
            {
            title: 'City of Glass',
            author: 'Paul Auster',
            },
        ];
        return books
      },
    },
  };

  export default bookResolvers