const path = require('path');
const pageFunc = require('./pageFunctions');

var tool = {
	goPage : function(req, res, REPO, JOB){
		var pages = ['dashboard','repo'];
		var now = '';

		console.log( req.query );
		console.log( req.query.page );

		if(req.query === undefined || (req.query.page === undefined && req.query.reload === undefined) ){
			var p = [req.query.page];
			res.render('dashboard', {page: p, error:'false'});
		}else if(req.query.page !== undefined){
			if( pages.find(req.query.page) == -1){
				console.log(" PAGE ERROR : ",req.query.page);
				res.render('reload', {page: 'dashboard', error:'true'});
			}else{
				now = req.query.page;
				var p = [now, REPO, JOB, pageFunc];
				res.render(now, {page: p, error:'false'});
			}
		}else if(req.query.reload !== undefined){
			res.render('reload', {page: req.query.reload, error:'false'});
		}
	}
};

module.exports = tool;