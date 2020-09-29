/* @copyright Itential, LLC 2019 (pre-modifications) */

/* eslint import/no-dynamic-require: warn */
/* eslint object-curly-newline: warn */

// Set globals
/* global log */

/* Required libraries.  */
const path = require('path');

/* Fetch in the other needed components for the this Adaptor */
const AdapterBaseCl = require(path.join(__dirname, 'adapterBase.js'));

/**
 * This is the adapter/interface into Chik-Fill-A-1000I
 */

/* GENERAL ADAPTER FUNCTIONS */
class ChikFillA1000I extends AdapterBaseCl {
  /**
   * ChikFillA1000I Adapter
   * @constructor
   */
  /* Working on changing the way we do Emit methods due to size and time constrainsts
  constructor(prongid, properties) {
    // Instantiate the AdapterBase super class
    super(prongid, properties);

    const restFunctionNames = this.getWorkflowFunctions();

    // Dynamically bind emit functions
    for (let i = 0; i < restFunctionNames.length; i += 1) {
      // Bind function to have name fnNameEmit for fnName
      const version = restFunctionNames[i].match(/__v[0-9]+/);
      const baseFnName = restFunctionNames[i].replace(/__v[0-9]+/, '');
      const fnNameEmit = version ? `${baseFnName}Emit${version}` : `${baseFnName}Emit`;
      this[fnNameEmit] = function (...args) {
        // extract the callback
        const callback = args[args.length - 1];
        // slice the callback from args so we can insert our own
        const functionArgs = args.slice(0, args.length - 1);
        // create a random name for the listener
        const eventName = `${restFunctionNames[i]}:${Math.random().toString(36)}`;
        // tell the calling class to start listening
        callback({ event: eventName, status: 'received' });
        // store parent for use of this context later
        const parent = this;
        // store emission function
        const func = function (val, err) {
          parent.removeListener(eventName, func);
          parent.emit(eventName, val, err);
        };
        // Use apply to call the function in a specific context
        this[restFunctionNames[i]].apply(this, functionArgs.concat([func])); // eslint-disable-line prefer-spread
      };
    }

    // Uncomment if you have things to add to the constructor like using your own properties.
    // Otherwise the constructor in the adapterBase will be used.
    // Capture my own properties - they need to be defined in propertiesSchema.json
    // if (this.allProps && this.allProps.myownproperty) {
    //   mypropvariable = this.allProps.myownproperty;
    // }
  }
  */

  /**
   * @callback healthCallback
   * @param {Object} reqObj - the request to send into the healthcheck
   * @param {Callback} callback - The results of the call
   */
  healthCheck(reqObj, callback) {
    // you can modify what is passed into the healthcheck by changing things in the newReq
    let newReq = null;
    if (reqObj) {
      newReq = Object.assign(...reqObj);
    }
    super.healthCheck(newReq, callback);
  }

  /**
   * updateAdapterConfiguration is used to update any of the adapter configuration files. This
   * allows customers to make changes to adapter configuration without having to be on the
   * file system.
   *
   * @function updateAdapterConfiguration
   * @param {string} configFile - the name of the file being updated (required)
   * @param {Object} changes - an object containing all of the changes = formatted like the configuration file (required)
   * @param {string} entity - the entity to be changed, if an action, schema or mock data file (optional)
   * @param {string} type - the type of entity file to change, (action, schema, mock) (optional)
   * @param {string} action - the action to be changed, if an action, schema or mock data file (optional)
   * @param {Callback} callback - The results of the call
   */
  updateAdapterConfiguration(configFile, changes, entity, type, action, callback) {
    super.updateAdapterConfiguration(configFile, changes, entity, type, action, callback);
  }

  /**
   * @callback healthCallback
   * @param {Object} result - the result of the get request (contains an id and a status)
   */
  /**
   * @callback getCallback
   * @param {Object} result - the result of the get request (entity/ies)
   * @param {String} error - any error that occurred
   */
  /**
   * @callback createCallback
   * @param {Object} item - the newly created entity
   * @param {String} error - any error that occurred
   */
  /**
   * @callback updateCallback
   * @param {String} status - the status of the update action
   * @param {String} error - any error that occurred
   */
  /**
   * @callback deleteCallback
   * @param {String} status - the status of the delete action
   * @param {String} error - any error that occurred
   */

  /**
   * @summary Determines if this adapter supports the specific entity
   *
   * @function hasEntity
   * @param {String} entityType - the entity type to check for
   * @param {String/Array} entityId - the specific entity we are looking for
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  hasEntity(entityType, entityId, callback) {
    const origin = `${this.id}-adapter-hasEntity`;
    log.trace(origin);

    // Make the call -
    // verifyCapability(entityType, actionType, entityId, callback)
    return this.verifyCapability(entityType, null, entityId, callback);
  }

  /**
   * @summary Provides a way for the adapter to tell north bound integrations
   * whether the adapter supports type, action and specific entity
   *
   * @function verifyCapability
   * @param {String} entityType - the entity type to check for
   * @param {String} actionType - the action type to check for
   * @param {String/Array} entityId - the specific entity we are looking for
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  verifyCapability(entityType, actionType, entityId, callback) {
    const meth = 'adapterBase-verifyCapability';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    // if caching
    if (this.caching) {
      // Make the call - verifyCapability(entityType, actionType, entityId, callback)
      return this.requestHandlerInst.verifyCapability(entityType, actionType, entityId, (results, error) => {
        if (error) {
          return callback(null, error);
        }

        // if the cache needs to be updated, update and try again
        if (results && results[0] === 'needupdate') {
          switch (entityType) {
            case 'template_entity': {
              // if the cache is invalid, update the cache
              return this.getEntities(null, null, null, null, (data, err) => {
                if (err) {
                  const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Could not update entity: $VARIABLE$, cache', [entityType], null, null, null);
                  log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
                  return callback(null, errorObj);
                }

                // need to check the cache again since it has been updated
                return this.requestHandlerInst.verifyCapability(entityType, actionType, entityId, (vcapable, verror) => {
                  if (verror) {
                    return callback(null, verror);
                  }

                  return this.capabilityResults(vcapable, callback);
                });
              });
            }
            default: {
              // unsupported entity type
              const result = [false];

              // put false in array for all entities
              if (Array.isArray(entityId)) {
                for (let e = 1; e < entityId.length; e += 1) {
                  result.push(false);
                }
              }

              return callback(result);
            }
          }
        }

        // return the results
        return this.capabilityResults(results, callback);
      });
    }

    // if no entity id
    if (!entityId) {
      // need to check the cache again since it has been updated
      return this.requestHandlerInst.verifyCapability(entityType, actionType, null, (vcapable, verror) => {
        if (verror) {
          return callback(null, verror);
        }

        return this.capabilityResults(vcapable, callback);
      });
    }

    // if not caching
    switch (entityType) {
      case 'template_entity': {
        // need to get the entities to check
        return this.getEntities(null, null, null, null, (data, err) => {
          if (err) {
            const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Could not update entity: $VARIABLE$, cache', [entityType], null, null, null);
            log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
            return callback(null, errorObj);
          }

          // need to check the cache again since it has been updated
          return this.requestHandlerInst.verifyCapability(entityType, actionType, null, (vcapable, verror) => {
            if (verror) {
              return callback(null, verror);
            }

            // is the entity in the list?
            const isEntity = this.entityInList(entityId, data.response, callback);
            const res = [];

            // not found
            for (let i = 0; i < isEntity.length; i += 1) {
              if (vcapable) {
                res.push(isEntity[i]);
              } else {
                res.push(false);
              }
            }

            return callback(res);
          });
        });
      }
      default: {
        // unsupported entity type
        const result = [false];

        // put false in array for all entities
        if (Array.isArray(entityId)) {
          for (let e = 1; e < entityId.length; e += 1) {
            result.push(false);
          }
        }

        return callback(result);
      }
    }
  }

  /**
   * @summary Updates the cache for all entities by call the get All entity method
   *
   * @function updateEntityCache
   *
   */
  updateEntityCache() {
    const origin = `${this.id}-adapter-updateEntityCache`;
    log.trace(origin);

    if (this.caching) {
      // if the cache is invalid, update the cache
      this.getEntities(null, null, null, null, (data, err) => {
        if (err) {
          log.trace(`${origin}: Could not load template_entity into cache - ${err}`);
        }
      });
    }
  }

  /**
   * @function iGetActiveAlerts
   * @pronghornType method
   * @name iGetActiveAlerts
   * @summary 1000I Get Active Alerts
   *
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {GET} /iGetActiveAlerts
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iGetActiveAlerts(callback) {
    const meth = 'adapter-iGetActiveAlerts';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const reqObj = null;

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iGetActiveAlerts', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iGetActiveAlerts'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }

  /**
   * @function iGetAlertsForAPeriod
   * @pronghornType method
   * @name iGetAlertsForAPeriod
   * @summary 1000I Get Alerts for a Period
   *
   * @param {query} from - from param
   * @param {query} to - to param
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {POST} /iGetAlertsForAPeriod
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iGetAlertsForAPeriod(from, to, callback) {
    const meth = 'adapter-iGetAlertsForAPeriod';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */
    if (from === undefined || from === null || from === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['from'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
    if (to === undefined || to === null || to === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['to'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = {};

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable] !== undefined && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== null
          && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== '') {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders, authData, callProperties, filter, priority, event
    // see adapter code documentation for more information on the request object's fields
    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iGetAlertsForAPeriod', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iGetAlertsForAPeriod'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }

  /**
   * @function iGetAlertDetails
   * @pronghornType method
   * @name iGetAlertDetails
   * @summary 1000I Get Alert Details
   *
   * @param {default} alertID - path parameter
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {POST} /iGetAlertDetails
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iGetAlertDetails(alertID, callback) {
    const meth = 'adapter-iGetAlertDetails';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */
    if (alertID === undefined || alertID === null || alertID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['alertID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [alertID];
    const bodyVars = {};

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable] !== undefined && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== null
          && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== '') {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders, authData, callProperties, filter, priority, event
    // see adapter code documentation for more information on the request object's fields
    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iGetAlertDetails', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iGetAlertDetails'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }

  /**
   * @function iRunA1000EyesTest
   * @pronghornType method
   * @name iRunA1000EyesTest
   * @summary 1000I Run a 1000Eyes Test
   *
   * @param {default} testID - path parameter
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {POST} /iRunA1000EyesTest
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iRunA1000EyesTest(testID, callback) {
    const meth = 'adapter-iRunA1000EyesTest';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */
    if (testID === undefined || testID === null || testID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['testID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [testID];
    const bodyVars = {};

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable] !== undefined && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== null
          && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== '') {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders, authData, callProperties, filter, priority, event
    // see adapter code documentation for more information on the request object's fields
    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iRunA1000EyesTest', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iRunA1000EyesTest'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }

  /**
   * @function iGetAlertMetrics
   * @pronghornType method
   * @name iGetAlertMetrics
   * @summary 1000I Get Alert Metrics
   *
   * @param {default} testID - path parameter
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {POST} /iGetAlertMetrics
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iGetAlertMetrics(testID, callback) {
    const meth = 'adapter-iGetAlertMetrics';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */
    if (testID === undefined || testID === null || testID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['testID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [testID];
    const bodyVars = {};

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable] !== undefined && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== null
          && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== '') {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders, authData, callProperties, filter, priority, event
    // see adapter code documentation for more information on the request object's fields
    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iGetAlertMetrics', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iGetAlertMetrics'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }

  /**
   * @function iGetAlertMetricsCopy
   * @pronghornType method
   * @name iGetAlertMetricsCopy
   * @summary 1000I Get Alert Metrics Copy
   *
   * @param {default} testID - path parameter
   * @param {default} agentID - path parameter
   * @param {default} roundID - path parameter
   * @param {getCallback} callback - a callback function to return the result
   * @return {object} results - An object containing the response of the action
   *
   * @route {POST} /iGetAlertMetricsCopy
   * @roles admin
   * @task true
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  iGetAlertMetricsCopy(testID, agentID, roundID, callback) {
    const meth = 'adapter-iGetAlertMetricsCopy';
    const origin = `${this.id}-${meth}`;
    log.trace(origin);

    /* HERE IS WHERE YOU VALIDATE DATA */
    if (testID === undefined || testID === null || testID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['testID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
    if (agentID === undefined || agentID === null || agentID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['agentID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
    if (roundID === undefined || roundID === null || roundID === '') {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Missing Data', ['roundID'], null, null, null);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [testID, agentID, roundID];
    const bodyVars = {};

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable] !== undefined && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== null
          && queryParamsAvailable[thisKeyInQueryParamsAvailable] !== '') {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders, authData, callProperties, filter, priority, event
    // see adapter code documentation for more information on the request object's fields
    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('Default', 'iGetAlertMetricsCopy', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          return callback(null, irReturnError);
        }
        if (!Object.hasOwnProperty.call(irReturnData, 'response')) {
          const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Invalid Response', ['iGetAlertMetricsCopy'], null, null, null);
          log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
          return callback(null, errorObj);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      const errorObj = this.requestHandlerInst.formatErrorObject(this.id, meth, 'Caught Exception', null, null, null, ex);
      log.error(`${origin}: ${errorObj.IAPerror.displayString}`);
      return callback(null, errorObj);
    }
  }
}

module.exports = ChikFillA1000I;
