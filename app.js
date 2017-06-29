const MongoClient = require( 'mongodb' ).MongoClient,
  commandLineArgs = require( 'command-line-args' ),
  commandLineUsage = require( 'command-line-usage' ),
  assert = require( 'assert' );

const options = commandLineOptions();

MongoClient.connect( 'mongodb://localhost:27017/crunchbase', function( err, db ) {
  assert.equal( err, null );
  console.log( "Successfully connected to MongoDB." );

  const query = queryDocument( options );

  const projection = {
    "_id": 0,
    "name": 1,
    "founded_year": 1,
    "number_of_employees": 1,
    "offices.country_code": 1,
    "ipo.valuation_amount": 1,
    "crunchbase_url": 1
  };

  const cursor = db.collection( 'companies' ).find( query, projection );

  let resultCount = 0;
  cursor.forEach( function( doc ) {
    resultCount++;
    console.log( doc );
  }, function( err ) {
    assert.equal( err, null );
    console.log( "Our query was: " + JSON.stringify( query ) );
    console.log( "Matching documents: " + resultCount );
    return db.close();
  } );
} );

function queryDocument( options ) {
  const query = {
    "founded_year": {
      "$gte": options.firstYear,
      "$lte": options.lastYear
    }
  };

  if ( "employees" in options ) {
    query.number_of_employees = {
      "$gte": options.employees
    };
  }

  if ( "ipo" in options ) {
    if ( options.ipo === "yes" ) {
      query[ "ipo.valuation_amount" ] = {
        "$exists": true,
        "$ne": null
      };
    } else if ( options.ipo === "no" ) {
      query[ "ipo.valuation_amount" ] = null;
    }
  }

  if ( "country" in options ) {
    query[ "offices.country_code" ] = options.country
  }

  return query;
}

function commandLineOptions() {
  const optionDefinitions = [ {
    name: "firstYear",
    alias: "f",
    type: Number
  }, {
    name: "lastYear",
    alias: "l",
    type: Number
  }, {
    name: "employees",
    alias: "e",
    type: Number
  }, {
    name: "ipo",
    alias: "i",
    type: String,
    description: "Should be either 'yes' or 'no'"
  }, {
    name: "country",
    alias: "c",
    type: String,
    description: "Should be a valid country code"
  } ];

  const options = commandLineArgs( optionDefinitions );

  if ( !( ( "firstYear" in options ) && ( "lastYear" in options ) ) ) {
    console.log( commandLineUsage( [ {
      header: "Usage",
      content: "The first two options below are required.  The rest are optional."
    }, {
      header: "Options",
      optionList: optionDefinitions
    } ] ) );
    process.exit();
  }

  return options;
}
