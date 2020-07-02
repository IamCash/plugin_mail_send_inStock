'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Mail = require('dw/net/Mail');
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

/**
 * @function sendMails
 * @description Function that deletes all custom object for a CO type passed as a parameter.
 *
 * @param {Object} parameters Represents the parameters defined in the steptypes.json file
 */

module.exports = {
	sendMails : function sendMails(parameters) {

		var iterator = CustomObjectMgr.getAllCustomObjects(parameters.CustomObjectType);
		
		while (iterator.hasNext()) {
            var customObject = iterator.next();
            let { ats, name} = getAvailabilityOfProduct(customObject.custom.skuId);
            name = name.replace('.', '');
            if(ats > 0){
                var url = ${urlPrefix} +customObject.custom.skuId
                sendMail(customObject.custom.email, name, url);
                Transaction.wrap(function () {
                    CustomObjectMgr.remove(customObject);
                });
            }	
		}
	}
};


function sendMail(recipient, productName, url) {
    var template = new Template('emailTemplate.isml');
    var o = new HashMap();
    o.put("productName",productName);
    o.put("url",url);

    var text = template.render(o);

    var mail = new Mail();
    mail.addTo(recipient);
    mail.setFrom("xyzg@gmail.com");
    mail.setSubject(productName + " | Product Available NOW!!");
    // sets the content of the mail as plain string
    mail.setContent(text);

    mail.send();
}

function getAvailabilityOfProduct(sku){
    //to get stock value
    var ProductMgr = require('dw/catalog/ProductMgr');

    var ats = ProductMgr.getProduct(sku).getAvailabilityModel().getInventoryRecord().getATS().getValue();

    //to get master name
    var name = ProductMgr.getProduct(sku).getVariationModel().getMaster().getName();

    return {
        ats : ats,
        name : name
    };



}
