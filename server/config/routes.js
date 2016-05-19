/**
 * Routes for express app
 */
import { newest } from '../controllers/suggestions'


export default (app, db) => {
  // user routes
  //////////////////////////////////////////////
  // Users Web API
  //////////////////////////////////////////////

  /**
  *** Fetch list of suggestions based in order of newest 
  *** Tested
  **/
  GET('/suggestions', newest(db));


  // Generic GET handler;
  function GET(url, handler) {
      app.get(url, (req, res) => {
          handler(req)
              .then(data => {
                  res.json({
                      success: true,
                      data
                  });
              })
              .catch(error => {
                  res.json({
                      success: false,
                      error: error.message || error
                  });
              });
      });
  }
};
