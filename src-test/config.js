/**
 * @author nttdocomo
 */
require.config({
	paths: {
		'taurus':'./'
	},
	baseUrl : location.pathname.replace(/^(\/taurus)?\/.*/,'$1') + '/src',
	charset : 'utf-8',
	vars : {
		'locale' : (navigator.language || navigator.browserLanguage).toLowerCase()
	}
});
require(['./index.js'])