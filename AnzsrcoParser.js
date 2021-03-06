/**
 * Copyright (c) 2011-2012 UQ ITEE e-Research Group
 * (The University of Queensland, Australia)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var AnzsrcoParser = function() {

	var schemeRegex = /^http\:\/\/purl.org\/asc\/[\d\.]+\/\d+\/[a-z]{3}\//;

	var descriptions = {};

	var labelIndex = {};
	var typeIndex = {};

	var resolverFunction = function(field) {
		return function() {
			var resolvedObjs = [];
			$.each(this[field],function(i,n) {
				var obj = descriptions[n];
				if (obj != null) {
					resolvedObjs.push(obj);
				}
			});
			return resolvedObjs;
		};
	};

	var createIndexEntry = function(index,key,value) {
		if (index[key] == null) {
			index[key] = [value];
		} else {
			index[key].push(value);
		}
	};

	var getIndexKeys = function(index) {
		return _.keys(index).sort();
	};

	var getByIndex = function(index,key) {
		if (key instanceof RegExp) {
			var matches = [];
			var matchingKeys = _.select(_.keys(index), function(k) {
				return k.match(key);
			});
			_.each(matchingKeys, function(k) {
				matches = matches.concat(index[k]);
			});
			return matches;
		} else {
			return index[key] || [];
		}
	};

	this.loadRdf = function(rdfText) {
		var xml = $.parseXML(rdfText);

		// Note: we have jquery.xmlns.js loaded to help us here
		var descriptionXml = $('*|Description', xml);

		descriptionXml.each(function(i,n) {
			var getResource = function(n) {
				if (typeof(n) != 'object') {
					return undefined;
				} else {
					return n.getAttribute('rdf:resource');
				}
			};
			var e = $(n);
			var scheme = getResource((e.find('inScheme').toArray())[0]);
			if (typeof(scheme) == 'undefined' || !scheme.match(schemeRegex)) {
				return;
			}
			var obj = {};
			obj.scheme = scheme;
			obj.about = e.attr('rdf:about');
			obj.code = e.find('code').text() || undefined;
			obj.label = $.trim(e.find('label').text());
			obj.clone = function() { return jQuery.extend({}, this); };

			_.each(['broader','narrower'], function(v) {
				obj[v+'Ids'] = _.map(e.find(v).toArray(),getResource).sort();
				obj[v] = resolverFunction(v+'Ids');
			});
			$.each(e.find('type'), function(i,v) {
				var resource = getResource(v);
				if (!resource.match(schemeRegex)) {
					return;
				}
				obj.type = resource;
			});

			descriptions[obj.about] = obj;
			createIndexEntry(labelIndex, obj.label, obj);
			createIndexEntry(typeIndex, obj.type, obj);
		});
	};


	this.getKnownLabels = function() {
		return getIndexKeys(labelIndex);
	};
	this.getKnownTypes = function() {
		return getIndexKeys(typeIndex);
	};

	this.getByLabel = function(label) {
		return getByIndex(labelIndex, label);
	};
	this.getByType = function(type) {
		return getByIndex(typeIndex, type);
	};

	this.buildTree = function(descriptions) {
		var treeDescriptions = {};
		var rootDescriptions = {};
		_.each(descriptions, function(obj) {
			treeDescriptions[obj.about] = obj.clone();
			var broader = obj;
			while (broader.broader().length != 0) {
				broader = (broader.broader())[0];
				if (typeof(treeDescriptions[broader.about]) == 'undefined') {
					treeDescriptions[broader.about] = broader.clone();
				}
			}
			rootDescriptions[broader.about] = treeDescriptions[broader.about];
		});
		_.each(treeDescriptions, function (d) {
			_.each(d.narrowerIds, function(childId) {
				if (typeof(treeDescriptions[childId]) != 'undefined') {
					if (typeof(d.children) == 'undefined') {
						d.children = [treeDescriptions[childId]];
					} else {
						d.children.push(treeDescriptions[childId]);
					}
				}
			});
		});
		var results = _.map(_.keys(rootDescriptions).sort(), function (k) {
			return rootDescriptions[k];
		});
		return results;
	};

	this.toJSON = function() {
		return descriptions;
	};

};