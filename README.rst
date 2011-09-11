``transitsign`` README
----------------------

Getting started
===============

Requires MongoDB > 2.0.0 (default configuration is fine).

0. Install dependencies with ``npm install .``
1. Edit ``config.json`` to comment out data sources as needed
2. Set API keys as needed in ``keys.json`` (copy ``keys-example.json``)
3. For each sign configuration, run: ``./bin/setsignconfig config.json <sign_name> <sign_config>.json`` (ex: ``./bin/setsignconfig rosslyn samplesigns/rosslyn.json``)
4. Run ``./bin/transitsign config.json``
5. Load ``http://localhost:8000/sign.html#<sign_name>`` in a WebKit browser (Chrome and Safari have been tested)
6. If size is insufficient:

  1. Click in the browser window and push ``s``
  2. Adjust size in the dialog that appears and click "OK"
  3. Reload for auto-sizing to take effect


Finding things in the codebase
==============================

* The frontend is in ``static/``:

  * The frontend CSS is in ``static/sign.css``
  * The frontend JavaScript is in ``static/scripts/sign.js`` and ``static/scripts/modules/*.js``
  * The frontend HTML is generated with `Google Closure Templates <http://code.google.com/p/closure-templates/>`_

    * The templates are in ``static/templates/``
    * The template JavaScript can be re-generated with ``java -jar closuretemplates/SoyToJsSrcCompiler.jar --outputPathFormat scripts/modules/{INPUT_FILE_NAME_NO_EXT}_template.js templates/*.soy``.

* The main parts of the backend are in ``lib/server.js``, ``lib/frontend.js``, ``lib/fetcher.js``

  * The modules which fetch data from external APIs are in ``lib/plugins/sources/``
  * The modules which send data to the client are in ``lib/plugins/frontends/``
