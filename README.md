ANZSCRO RDF Parser
==================

This utility library parses the SKOS RDF representations from the [ANZSCRO
project][1] to provide "Field Of Research", "Socio-economic Objective" and "Type
of Activity" identifiers.

The parser primarily searches based on label using `getByLabel(string|regex)`
but results may also be built into trees using `buildTree(results)` to provide
hierarchical result trees.

Display is left to UI libraries, however this parser has been used successfully
with [jsTree](http://www.jstree.com/).

eg.

```javascript
var parser = new AnzsrcoParser();
parser.loadRdf(rdfString);

var getTree = function(searchTerm, parser) {
    var results = parser.getByLabel(searchTerm);
	var tree = parser.buildTree(results);

	var tmpl = function(inner) {
		return '<span class="result">'
		+ '<input type="hidden" name="about" value="<%=about%>"/>'
		+ '<input type="hidden" name="scheme" value="<%=scheme%>"/>'
		+ inner + '</span>';
	};
	var codeAndTitleTemplate = _.template(tmpl('<%=code%> - <%=label%>'));
	var titleTemplate = _.template(tmpl('<%=label%>'));

	var mapFunc = function(i, n) {
		var hasChildren = (n.children && n.children.length > 0);
		return {
			'title' : n.code ? codeAndTitleTemplate(n) : titleTemplate(n),
			'data' : {
				'jstree' : { opened : false}
			},
			'children' : hasChildren ? $(n.children).map(mapFunc).toArray()
					: null
		};
	};

	return $(tree).map(mapFunc).toArray();

};

var tree = getTree(/economics/i, parser);
$('#tree').jstree({
	'json' : {
		'data' : tree,
		'progressive_render' : true
	},
	'plugins' : [ 'core', 'json', 'ui' ]
});
```

[1]: http://anzsrco.github.com/anzsrco/