import mysql from "mysql2/promise";

export async function query({query,values = []}) {
	// create the connection
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	});
	try {
		//const [results] = await connection.execute(query, values);
		const [results] = await connection.query(query,[values]); //use when insert multiple data
		connection.end();
		return results;
	} catch (error) {
		return { error}
	}
}