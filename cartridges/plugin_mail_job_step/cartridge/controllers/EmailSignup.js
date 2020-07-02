'use strict';

var server = require('server');
//Use the following for CSRF protection: add middleware in routes and hidden field on form
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');



server.post(
    'Handler',
    server.middleware.https,
    function (req, res, next) {
    	
    	var URLUtils = require('dw/web/URLUtils');
		var CustomObjectMgr = require('dw/object/CustomObjectMgr');
		
            this.on('route:BeforeComplete', function (req, res) {
                var Transaction = require('dw/system/Transaction');
                
                try {
                    Transaction.wrap(function () {
                        var CustomObject = CustomObjectMgr.createCustomObject('NotifyMeSubscription',  req.form.email.trim()+'_'+req.form.skuId.trim());
                        CustomObject.custom.email = req.form.email;
                        CustomObject.custom.skuId = req.form.skuId;
                	  
                        res.json({
                            success: true,
                            redirectUrl: URLUtils.url('EmailSignup-Success').toString()
                        });
                    }); 
                } catch (e) {
                	var err = e;
                	var Resource = require('dw/web/Resource');
                	if (err.javaName === "MetaDataException") {
                		// Error is duplicate primary key: send back array with error message
	                	res.json({
	                		success: false,
	                        error: [Resource.msg('error.subscriptionexists', 'newsletter', null)]
	                    });
                	} else {
	                    // Error is missing custom object: Log error with clear message for site admin to see
                		var Logger = require('dw/system/Logger');
                		Logger.getLogger("sample").warn(Resource.msg('error.customobjectmissing', 'newsletter', null));
                		// Show error page: there is nothing user can do to fix this
                        res.setStatusCode(500);
                        res.json({
                            error: true,
                            redirectUrl: URLUtils.url('Home-Show').toString()
                        });
                	}

                }
            });
  		
        next();
    }
);

server.get(
    'Success',
    server.middleware.https,
    function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    homeUrl = URLUtils.url('Home-Show');
        res.render('emailSignupSuccess',{
            homeUrl: homeUrl
        });

        next();
    }
);

module.exports = server.exports();