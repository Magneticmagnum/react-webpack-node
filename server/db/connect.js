var pgp = require('pg-promise')({
    //Initialization
});

// Connection parameters
const connection = {
    host: 'localhost',
    port: 5432,
    database: 'suggestionboxtest',
    user: 'postgres',
    password: 'postgres'
};

// // Global object from connection details
export default ()=> {
	pgp(connection)
		.then(()=>{
			console.log("connected to pg db")
		})
		.catch(()=>{
			console.log("error connecting to pg db")
		})
} 