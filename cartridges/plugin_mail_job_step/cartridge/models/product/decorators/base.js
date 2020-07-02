'use strict';

var base = module.superModule;

module.exports = function (object, apiProduct, type){
	base.call(this, object, apiProduct, type); 
	
	Object.defineProperty(object, 'stockNotification', {
        enumerable: true,
        value: apiProduct.custom.StockNotification
	});
};
