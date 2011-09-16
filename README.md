ANZSCRO RDF Parser
==================

This utility library parses the SKOS RDF representations from the [ANZSCRO
project][1] to provide "Field Of Research", "Socio-economic Objective" and "Type
of Activity" identifiers.

The parser primarily searches based on label using `getByLabel(string|regex)`
but results may also be built into trees using `buildTree(results)` to provide
hierarchical result trees.

Display is left to UI libraries, however this parser has been used successfully
with jsTree.

[1]: http://anzsrco.github.com/anzsrco/