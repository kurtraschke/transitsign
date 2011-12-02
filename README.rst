======================
``transitsign`` README
======================

Getting started
===============

Requires MongoDB > 2.0.0 (default configuration is fine).

#. Install dependencies with ``npm install .``
#. Edit ``server-config.json`` to comment out data sources as needed
#. Set API keys

   * Possible key names are:

     * ``BART``
     * ``WMATA``
     * ``TriMet``
     * ``CTARail``
     * ``CTABus``
     * ``CUMTD``

   * To set a key, run ``npm config set transitsign:_key-BART MW9S-E7SL-26DU-VV8V``,
     replacing ``BART`` with a key name from the list above, and the
     key with your assigned key. *(The BART key given here is safe to
     use and disclose, as it's the demo key.)*

#. Run ``npm run-script loadstaticdata``
#. Run ``npm run-script loadsigns``
#. Run ``npm start``
#. Load ``http://localhost:8000/sign.html#<sign_name>`` in a WebKit browser (Chrome and Safari have been tested)


Adjusting sign size
-------------------

1. Click in the browser window and type ``s``
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
