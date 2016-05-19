
// Connection parameters
const connection = {
    host: 'localhost',
    port: 5432,
    database: 'suggestionboxtest',
    user: 'postgres',
    password: 'postgres'
};

// // Global object from connection details
export default (pgp)=> {
	pgp(connection)
} 