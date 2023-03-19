const commands = [
    {
      name: 'search',
      description: 'Searches for a book by title',
      options: [
        {
          "name": "title",
          "description": "Title of the book you're searching for",
          "requried": true,
          "type": 3,
        }
      ]
    },
    {
      name: 'currently_reading',
      description: 'Get users currently reading books',
      options: [
        {
          "name": "user",
          "description": "User ID",
          "required": false,
          "type": 3,
        }
      ]
    },
    {
      name: 'top_rated',
      description: 'Get the users top rated books (Max 5)',
      options: [
        {
          "name": "user",
          "description": "User ID",
          "required": false,
          "type": 3,
        }
      ]
    },
    {
      name: 'popular_month',
      description: 'This months most popular books'
    },
    {
      name: 'add_user',
      description: 'Store your goodreads ID',
      options: [
        {
          "name": "user",
          "description": "User ID",
          "required": false,
          "type": 3,
        }
      ]
    },
    {
      name: 'get_profile',
      description: 'Show a profile preview',
      options: [
        {
          "name": "user",
          "description": "User ID",
          "required": false,
          "type": 3,
        }
      ]
    },
    {
      name: 'quote',
      description: 'Get a random quote',
    },
    {
      name: 'help',
      description: 'Gives a list of all commands'
    }
    
  ];
  module.exports = {commands};