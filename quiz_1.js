var MongoClient = require( 'mongodb' ).MongoClient,
  assert = require( 'assert' );

MongoClient.connect( 'mongodb://localhost:27017/crunchbase', function( err, db ) {
  assert.equal( err, null );
  console.log( "Successfully connected to MongoDB." );

  var query = {
    "founded_year": 2010
  };

  var cursor = db.collection( 'companies' ).find( query );
  cursor.project( {
    "_id": 0,
    "name": 1,
    "number_of_employees": 1
  } );

  cursor.forEach( function( doc ) {
    console.log( doc.name + " has " + doc.number_of_employees + " employees." );
  }, function( err ) {
    assert.equal( err, null );
    return db.close();
  } );
} );
