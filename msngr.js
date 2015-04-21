
var msngr = msngr || (function () {
	"use strict";

	return {
		version: "2.0.0",
		extend: function (obj, target) {
			target = (target || msngr);
			if (Object.prototype.toString.call(obj) === "[object Object]") {
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
							if (target[key] === undefined) {
								target[key] = { };
							}
							target[key] = msngr.extend(obj[key], target[key]);
						} else if (Object.prototype.toString.call(obj[key]) === "[object Array]") {
							target[key] = (target[key] || []).concat(obj[key]);
						} else {
							target[key] = obj[key];
						}
					}
				}
			}
			return target;
		}
	};
}());

msngr.extend((function () {
	"use strict";

	return {
		utils: {
			argumentsToArray: function (args) {
				if (msngr.utils.isArray(args)) {
					return args;
				}

				return Array.prototype.slice.call(args, 0);
			}
		}
	};
}()));

msngr.extend((function () {
    "use strict";

    return {
        utils: {
            isHtmlElement: function (obj) {
                var t = this.getType(obj);
                return (t.indexOf("[object HTML") === 0) || (t.indexOf("[object global]") === 0);
            },
            isNodeList: function (obj) {
                return (this.getType(obj) === "[object NodeList]");
            },
            findElement: function (element, root) {
                var elms = msngr.utils.findElements(element);
                if (elms !== undefined && elms.length > 0) {
                    return elms[0];
                }

                return elms;
            },
            findElements: function (selector, root) {
                var elm;
                if (msngr.utils.isHtmlElement(selector)) {
                    elm = selector;
                }

                if (elm === undefined && msngr.utils.isString(selector)) {
                    var doc = root || document;
                    var result = doc.querySelectorAll(selector);
                    if (result !== null) {
                        elm = result;
                    }
                }

                return elm;
            },
            getDomPath: function (element) {
                var node = msngr.utils.isHtmlElement(element) ? element : undefined;
                if (node === undefined) {
                    return undefined;
                }

                if (node.id === undefined) {
                    node.id = msngr.utils.id();
                }

                return "#" + node.id;
            },
            querySelectorAllWithEq: function (selector, root) {
                if (selector === undefined) {
                    return null;
                }
                var doc = root || document;
                var queue = [];
                var process = function (input) {
                    if (input.indexOf(":eq(") === -1) {
                        return undefined;
                    }

                    var eqlLoc = input.indexOf(":eq(");
                    var sel = input.substring(0, eqlLoc);
                    var ind = input.substring((eqlLoc + 4), input.indexOf(")", eqlLoc));
                    selector = input.substring(input.indexOf(")", eqlLoc) + 1, input.length);

                    if (sel.charAt(0) === ">") {
                        sel = sel.substring(1, sel.length);
                    }

                    if (selector.charAt(0) === ">") {
                        selector = selector.substring(1, selector.length);
                    }

                    queue.push({
                        selector: sel,
                        index: parseInt(ind, 10)
                    });
                }
                while (selector.indexOf(":eq") !== -1) {
                    process(selector);
                }

                var result;
                while (queue.length > 0) {
                    var item = queue.shift();
                    result = (result || doc).querySelectorAll(item.selector)[item.index];
                }

                if (selector.trim().length > 0) {
                    return (result || doc).querySelectorAll(selector);
                }
                return [result];
            },
            querySelectorWithEq: function (selector) {
                return msngr.utils.querySelectorAllWithEq(selector)[0];
            }
        }
    };
}()));

msngr.extend((function () {
	"use strict";

	var nowPerformance = function () {
		return performance.now();
	};

	var nowNode = function () {
		return (process.hrtime()[1] / 1000000);
	};

	var nowLegacy = function () {
		return (new Date).getTime();
	};

	var nowExec = undefined;
	var nowExecDebugLabel = "";
	var lastNow = undefined;

	return {
		utils: {
			id: function () {
				var d = msngr.utils.now();
				var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = (d + Math.random()*16)%16 | 0;
					d = Math.floor(d/16);
					return (c=='x' ? r : (r&0x3|0x8)).toString(16);
				});
				return uuid;
			},
			now: function (noDuplicate) {
				if (nowExec === undefined) {
					if (typeof performance !== "undefined") {
						nowExec = nowPerformance;
						nowExecDebugLabel = "performance";
					} else if (typeof process !== "undefined") {
						nowExec = nowNode;
						nowExecDebugLabel = "node";
					} else {
						nowExec = nowLegacy;
						nowExecDebugLabel = "legacy";
					}
				}
				var now = nowExec();
				if (noDuplicate === true && lastNow === now) {
					return msngr.utils.now(noDuplicate);
				}
				lastNow = now;
				return now;
			}
		}
	};
}()));

/*
    ./src/utils/smart.js

    Smart arguments is a programatic way of defining how data passed into a method
    is translated into a JavaScript object to allow shorthand calling of methods

    Smart argument definition is as follows with this example:
    {
        expanded: [
            { key: "topic", type: smartypes.string },
            { key: "category", type: smartypes.string },
            { key: "dataType", type: smartypes.string },
            { key: "payload", type: smartypes.any },
        ],
        final: [smartypes.object, smartypes.function]
    }
*/
msngr.extend((function () {
	"use strict";

	return {
		utils: {
            smartypes: {
                string: "[object String]",
                date: "[object Date]",
                array: "[object Array]",
                object: "[object Object]",
                function: "[object Function]",
                number: "[object Number]",
                any: "[object *]"
            },
			smart: function (definition, args) {
                var result = [];
                if (!msngr.utils.exist(definition) || !msngr.utils.exist(args)) {
                    return result;
                }


            }
		}
	};
}()));

msngr.extend((function () {
	"use strict";

	return {
		utils: {
			getType: function (obj) {
				if (!msngr.utils.exist(obj)) {
					return "" + obj;
				}
				return Object.prototype.toString.call(obj);
			},
			isArguments: function (obj) {
				return (msngr.utils.getType(obj) === "[object Arguments]");
			},
			areArguments: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isArguments, msngr.utils.argumentsToArray(arguments));
			},
			isNullOrUndefined: function (obj) {
				return (obj === undefined || obj === null);
			},
			exist: function (obj) {
				return !msngr.utils.isNullOrUndefined(obj);
			},
			exists: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.exist, msngr.utils.argumentsToArray(arguments));
			},
			isString: function (str) {
	            return (msngr.utils.getType(str) === "[object String]");
	        },
			areStrings: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isString, msngr.utils.argumentsToArray(arguments));
			},
	        isDate: function (obj) {
	            return (msngr.utils.getType(obj) === "[object Date]");
	        },
			areDates: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isDate, msngr.utils.argumentsToArray(arguments));
			},
	        isArray: function (obj) {
	            return (msngr.utils.getType(obj) === "[object Array]");
	        },
			areArrays: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isArray, msngr.utils.argumentsToArray(arguments));
			},
	        isNumber: function (obj) {
	            return (msngr.utils.getType(obj) === "[object Number]");
	        },
			areNumbers: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isNumber, msngr.utils.argumentsToArray(arguments));
			},
	        isObject: function (obj) {
	            return (msngr.utils.getType(obj) === "[object Object]");
	        },
			areObjects: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isObject, msngr.utils.argumentsToArray(arguments));
			},
	        isFunction: function (func) {
	            return (msngr.utils.getType(func) === "[object Function]");
	        },
			areFunctions: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isFunction, msngr.utils.argumentsToArray(arguments));
			},
	        isEmptyString: function (str) {
	            var isStr = msngr.utils.isString(str);
	            if (str === undefined || str === null || (isStr && str.toString().trim().length === 0)) {
	                return true;
	            }
	            return false;
	        },
			areEmptyStrings: function () {
				return msngr.utils.reiterativeValidation(msngr.utils.isEmptyString, msngr.utils.argumentsToArray(arguments));
			},
			hasWildCard: function (str) {
				return (str.indexOf("*") !== -1);
			},
			reiterativeValidation: function (validationMethod, inputs) {
				var result = false;
				if (msngr.utils.exist(validationMethod) && msngr.utils.exist(inputs)) {
					if (!msngr.utils.isArray(inputs)) {
						inputs = [inputs];
					}
					for (var i = 0; i < inputs.length; ++i) {
						result = validationMethod.apply(this, [inputs[i]]);
						if (result === false) {
							break;
						}
					}
				}
				return result;
			}
	    }
	};
}()));

/*
    ./src/builders/message.js
*/
msngr.extend((function () {
	"use strict";

	return {
		builders: {
			msg: function () {
				return (function () {
					var message = { };
					var props = ["topic", "category", "dataType", "payload"].concat(msngr.getAvailableActions());

					var obj = {
						build: function () {
							return message;
						}
					};

					for (var i = 0; i < props.length; ++i) {
						(function (key) {
							obj[key] = function (input) {
								message[key] = input;
								return obj;
							};
						}(props[i]));
					}

					return obj;
				}());
			}
		}
	};
}()));

msngr.extend((function () {
  "use strict";

  // Index for id to message objects
  var id_to_message = { };

  // Direct index (no partials) for message
  var direct_index = {
      topic_to_id: { },
      topic_cat_to_id: { },
      topic_type_to_id: { },
      topic_cat_type_to_id: { }
  };

  // Message index count
  var index_count = 0;

  var deleteValueFromArray = function (arr, value) {
      var inx = arr.indexOf(value);
      var endIndex = arr.length - 1;
      if (inx !== endIndex) {
          var temp = arr[endIndex];
          arr[endIndex] = arr[inx];
          arr[inx] = temp;
      }
      arr.pop();
  };

  return {
      store: {
          index: function (message) {
              if (msngr.utils.exist(message) && msngr.utils.exist(message.topic)) {
                  var uuid = msngr.utils.id();
                  id_to_message[uuid] = message;

                  if (direct_index.topic_to_id[message.topic] === undefined) {
                      direct_index.topic_to_id[message.topic] = [];
                  }
                  direct_index.topic_to_id[message.topic].push(uuid);

                  if (msngr.utils.exist(message.category)) {
                      if (direct_index.topic_cat_to_id[message.topic] === undefined) {
                          direct_index.topic_cat_to_id[message.topic] = { };
                      }

                      if (direct_index.topic_cat_to_id[message.topic][message.category] === undefined) {
                          direct_index.topic_cat_to_id[message.topic][message.category] = [];
                      }

                      direct_index.topic_cat_to_id[message.topic][message.category].push(uuid);
                  }

                  if (msngr.utils.exist(message.dataType)) {
                      if (direct_index.topic_type_to_id[message.topic] === undefined) {
                          direct_index.topic_type_to_id[message.topic] = { };
                      }

                      if (direct_index.topic_type_to_id[message.topic][message.dataType] === undefined) {
                          direct_index.topic_type_to_id[message.topic][message.dataType] = [];
                      }

                      direct_index.topic_type_to_id[message.topic][message.dataType].push(uuid);
                  }

                  if (msngr.utils.exist(message.category) && msngr.utils.exist(message.dataType)) {
                      if (direct_index.topic_cat_type_to_id[message.topic] === undefined) {
                          direct_index.topic_cat_type_to_id[message.topic] = { };
                      }

                      if (direct_index.topic_cat_type_to_id[message.topic][message.category] === undefined) {
                          direct_index.topic_cat_type_to_id[message.topic][message.category] = { };
                      }

                      if (direct_index.topic_cat_type_to_id[message.topic][message.category][message.dataType] === undefined) {
                          direct_index.topic_cat_type_to_id[message.topic][message.category][message.dataType] = [];
                      }

                      direct_index.topic_cat_type_to_id[message.topic][message.category][message.dataType].push(uuid);
                  }

                  index_count++;

                  return uuid;
              }
              return undefined;
          },
          delete: function (uuid) {
              if (msngr.utils.exist(uuid) && msngr.utils.exist(id_to_message[uuid])) {
                  var message = id_to_message[uuid];

                  if (msngr.utils.exist(message.topic)) {
                      deleteValueFromArray(direct_index.topic_to_id[message.topic], uuid);

                      if (msngr.utils.exist(message.category)) {
                          deleteValueFromArray(direct_index.topic_cat_to_id[message.topic][message.category], uuid);
                      }

                      if (msngr.utils.exist(message.dataType)) {
                          deleteValueFromArray(direct_index.topic_type_to_id[message.topic][message.dataType], uuid);
                      }

                      if (msngr.utils.exist(message.category) && msngr.utils.exist(message.dataType)) {
                          deleteValueFromArray(direct_index.topic_cat_type_to_id[message.topic][message.category][message.dataType], uuid);
                      }
                  }

                  delete id_to_message[uuid];
                  index_count--;

                  return true;
              }
              return false;
          },
          query: function (message) {
              if (msngr.utils.exist(message)) {
                  if (msngr.utils.exist(message.topic)) {
                      // Topic Only Results
                      if (!msngr.utils.exist(message.category) && !msngr.utils.exist(message.dataType)) {
                          return direct_index.topic_to_id[message.topic] || [];
                      }

                      // Topic + Category Results
                      if (msngr.utils.exist(message.category) && !msngr.utils.exist(message.dataType)) {
                          return (direct_index.topic_cat_to_id[message.topic] || { })[message.category] || [];
                      }

                      // Topic + Data Type Results
                      if (msngr.utils.exist(message.dataType) && !msngr.utils.exist(message.category)) {
                          return (direct_index.topic_type_to_id[message.topic] || { })[message.dataType] || [];
                      }

                      // Topic + Category + Data Type Results
                      if (msngr.utils.exist(message.category) && msngr.utils.exist(message.dataType)) {
                          return ((direct_index.topic_cat_type_to_id[message.topic] || { })[message.category] || { })[message.dataType] || [];
                      }
                  }
              }

              return [];
          },
          clear: function () {
              // Index for id to message objects
              id_to_message = { };

              // Direct index (no partials) for message
              direct_index = {
                  topic_to_id: { },
                  topic_cat_to_id: { },
                  topic_type_to_id: { },
                  topic_cat_type_to_id: { }
              };

              index_count = 0;

              return true;
          },
          count: function () {
              return index_count;
          }
      }
  };
}()));

msngr.extend((function () {
    "use strict";

    // Throw statements
    var InvalidParametersException = function (str) {
        return {
            severity: "unrecoverable",
            message: ("Invalid parameters supplied to the {method} method".replace("{method}", str))
        };
    };

    var UnexpectedException = function (str) {
        return {
            severity: "unrecoverable",
            message: ("An unexpected exception occured in the {method} method".replace("{method}", str))
        };
    };

    var registerdPaths = { };
    var registerdEvents = 0;

    var listener = function (event) {
        var node = this;
        var path = msngr.utils.getDomPath(node);

        if (msngr.utils.exist(registerdPaths[path])) {
            if (msngr.utils.exist(registerdPaths[path][event.type])) {
                return msngr.emit(registerdPaths[path][event.type], event);
            }
        }

        // How did we get here? Must be a memory leak or something. Ugh
        return msngr;
    };

    return {
        bind: function (element, event, topic, category, dataType) {
            if (!msngr.utils.exist(element) || !msngr.utils.exist(event) || !msngr.utils.exist(topic)) {
                throw InvalidParametersException("bind");
            }
            if (msngr.utils.isObject(topic) && !msngr.utils.exist(topic.topic)) {
                throw InvalidParametersException("bind");
            }

            var node = msngr.utils.findElement(element);
            var path = msngr.utils.getDomPath(node);

            if (!msngr.utils.exist(registerdPaths[path])) {
                registerdPaths[path] = { };
            }

            var message = undefined;
            if (msngr.utils.isObject(topic)) {
                message = topic;
            } else {
                message = { };
                message.topic = topic;

                if (msngr.utils.exist(category)) {
                    message.category = category;
                }

                if (msngr.utils.exist(dataType)) {
                    message.dataType = dataType;
                }
            }

            registerdPaths[path][event] = message;

            node.addEventListener(event, listener);

            registerdEvents++;

            return msngr;
        },
        unbind: function (element, event) {
            var node = msngr.utils.findElement(element);
            var path = msngr.utils.getDomPath(node);

            if (msngr.utils.exist(registerdPaths[path])) {
                if (msngr.utils.exist(registerdPaths[path][event])) {
                    node.removeEventListener(event, listener);

                    delete registerdPaths[path][event];

                    registerdEvents--;
                }
            }

            return msngr;
        },
        getBindCount: function () {
            return registerdEvents;
        }
    };
}()));

msngr.extend((function () {
    "use strict";

    // Throw statements
    var InvalidParameters = function (str) {
        return {
            severity: "unrecoverable",
            message: ("Invalid parameters supplied to the {method} method".replace("{method}", str))
        };
    };

    var delegates = { };
    var delegateCount = 0;

    var executeSync = function (method, context, params, message) {
        (function (m, c, p, msg) {
            var cont = true;
            var wrap = {
                preventDefault: function () {
                    cont = false;
                },
                payload: p[0],
                done: function () {
                    if (cont === true) {
                        m.apply(c, [wrap.payload]);
                    }
                }
            };
            msngr.act(msg, wrap);
        }(method, context, params, message));
    };

    var execute = function (method, context, params, message) {
        (function (m, c, p, msg) {
            setTimeout(function () {
                executeSync(m, c, p, msg);
            }, 0);
        }(method, context, params, message));
    };

    var _emit = function (message, payload, callback) {
        var uuids = msngr.store.query(message);
        if (uuids.length > 0) {
            for (var i = 0; i < uuids.length; ++i) {
                var del = delegates[uuids[i]];
                var params = [];
                if (msngr.utils.exist(payload || message.payload)) {
                    params.push(payload || message.payload);
                }
                execute(del.callback, del.context, params, message);
            }
        }

        return msngr;
    };

    var _on = function (message, callback) {
        var uuid = msngr.store.index(message);
        delegates[uuid] = {
            callback: callback,
            context: (message.context || this),
            onedMessage: message
        };
        delegateCount++;

        return msngr;
    };

    var _drop = function (message) {
        var uuids = msngr.store.query(message);
        if (uuids.length > 0) {
            for (var i = 0; i < uuids.length; ++i) {
                var uuid = uuids[i];
                delete delegates[uuid];
                delegateCount--;

                msngr.store.delete(uuid);
            }
        }

        return msngr;
    };

    return {
        emit: function (topic, category, dataType, payload, callback) {
            if (!msngr.utils.exist(topic)) {
                throw InvalidParameters("emit");
            }

            var message;
            if (msngr.utils.isObject(topic)) {
                message = topic;
                if (!msngr.utils.exist(payload) && msngr.utils.exist(category)) {
                    payload = category;
                }
                if (!msngr.utils.exist(callback) && msngr.utils.exist(dataType) && msngr.utils.isFunction(dataType)) {
                    callback = dataType;
                }
                return _emit(message, payload, callback);
            }

            message = { };
            var args = msngr.utils.argumentsToArray(arguments);

            message.topic = args.shift();

            if (!msngr.utils.exist(payload)) {
                if (args.length > 0 && msngr.utils.isObject(args[0])) {
                    payload = args.shift();

                    return _emit(message, payload);
                }
            }

            message.category = args.shift();

            if (args.length > 0 && msngr.utils.isObject(args[0])) {
                payload = args.shift();

                return _emit(message, payload);
            }
            message.dataType = args.shift();

            return _emit(message, payload);
        },
        on: function (topic, category, dataType, callback) {
            if (!msngr.utils.exist(topic)) {
                throw InvalidParameters("on");
            }

            var message;
            if (msngr.utils.isObject(topic)) {
                message = topic;
                if (!msngr.utils.exist(callback) && msngr.utils.exist(category)) {
                    callback = category;
                }
                return _on(message, callback);
            }
            if (arguments.length > 1) {
                message = { };
                var args = msngr.utils.argumentsToArray(arguments);

                callback = callback || args.pop();

                message.topic = args.shift();

                message.category = args.shift();
                message.dataType = args.shift();

                return _on(message, callback);
            }

            throw InvalidParameters("on");
        },
        drop: function (topic, category, dataType) {
            if (!msngr.utils.exist(topic)) {
                throw InvalidParameters("drop");
            }

            var message;
            if (msngr.utils.isObject(topic)) {
                message = topic;
                return _drop(message);
            } else {
                message = { };
                if (msngr.utils.exist(topic)) {
                    message.topic = topic;
                }

                if (msngr.utils.exist(category)) {
                    message.category = category;
                }

                if (msngr.utils.exist(dataType)) {
                    message.dataType = dataType;
                }
                return _drop(message);
            }

            throw InvalidParameters("drop");
        },
        dropAll: function () {
            delegates = { };
            delegateCount = 0;
            msngr.store.clear();

            return msngr;
        },
        getMessageCount: function () {
            return delegateCount;
        }
    };
}()));

msngr.extend((function () {
    "use strict";

    // Throw statements
    var InvalidParameters = function (str) {
        return {
            name: "InvalidParameters",
            severity: "unrecoverable",
            message: ("Invalid parameters supplied to the {method} method".replace("{method}", str))
        };
    };

    var ReservedKeywords = function (keyword) {
        return {
            name: "ReservedKeywordsException",
            severity: "unrecoverable",
            message: ("Reserved keyword {keyword} supplied as action.".replace("{keyword}", keyword))
        };
    };

    var reservedProperties = ["topic", "category", "dataType", "payload"];
    var actions = { };
    var actionsCount = 0;

    return {
        action: function (property, handler) {
            if (!msngr.utils.exist(property) || !msngr.utils.exist(handler)) {
                throw InvalidParameters("action");
            }

            if (reservedProperties.indexOf(property) !== -1) {
                throw ReservedKeywords(property);
            }

            actions[property] = handler;
            actionsCount++;
        },
        inaction: function (property) {
            if (!msngr.utils.exist(property)) {
                throw InvalidParameters("inaction");
            }

            delete actions[property];
            actionsCount--;
        },
        act: function (message, superWrap) {
            if (!msngr.utils.exist(message) || !msngr.utils.exist(superWrap)) {
                throw InvalidParameters("act");
            }

            (function (msg, sw) {
                if (actionsCount > 0) {
                    var wrap = {
                        preventDefault: function () {
                            sw.preventDefault();
                        },
                        payload: sw.payload
                    };
                    for (var key in msg) {
                        if (msg.hasOwnProperty(key)) {
                            if (reservedProperties.indexOf(key) === -1) {
                                if (actions[key] !== undefined) {
                                    actions[key].apply(this, [msg, wrap]);
                                }
                            }
                        }
                    }
                    sw.payload = wrap.payload;
                }
                return sw.done();
            }(message, superWrap));
        },
        getActionCount: function () {
            return actionsCount;
        },
        getAvailableActions: function () {
            return Object.keys(actions);
        }
    };
}()));

msngr.action("dom", function (message, wrap) {
    "use strict";

    if (msngr.utils.exist(message.dom)) {
        var norm = {
            gather: undefined,
            doc: undefined
        };
        if (!msngr.utils.isObject(message.dom)) {
            if (msngr.utils.isArray(message.dom)) {
                norm.gather = message.dom;
            } else if (msngr.utils.isString(message.dom)) {
                norm.gather = [message.dom];
            }
        } else {
            if (msngr.utils.exist(message.dom.gather)) {
                norm.gather = (msngr.utils.isArray(message.dom.gather) ? message.dom.gather : [message.dom.gather]);
            }
            if (msngr.utils.exist(message.dom.root || message.dom.doc)) {
                norm.doc = message.dom.root || message.dom.doc;
            }
        }

        if (msngr.utils.exist(norm.gather) && norm.gather.length > 0) {
            if (!msngr.utils.isObject(wrap.payload)) {
                wrap.payload = { };
            }

            for (var i = 0; i < norm.gather.length; ++i) {
                var elms = msngr.utils.findElements(norm.gather[i], message.dom.root);
                if (msngr.utils.exist(elms) && elms.length > 0) {
                    for (var j = 0; j < elms.length; ++j) {
                        var elm = elms[j];

                        var prop;
                        if (msngr.utils.exist(elm.getAttribute("name")) && !msngr.utils.isEmptyString(elm.getAttribute("name"))) {
                            prop = elm.getAttribute("name");
                        } else if (msngr.utils.exist(elm.id) && !msngr.utils.isEmptyString(elm.id)) {
                            prop = elm.getAttribute("id");
                            console.log(elm.id);
                        } else {
                            prop = elm.tagName.toLowerCase() + j;
                        }

                        wrap.payload[prop] = elm.value;
                    }
                }
            }
        }
    }

    return msngr;
});

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = msngr;
}
