var config = {
  'weather_id': 'KDCA',
  'slides': [
    {
      'type': 'modules/metrorail',
      'displayTime': 25,
      'parameters': {'rtus': ['C05'], 'filter': -2}
    },
    /*{
      'type': 'Metrorail',
      'displayTime': 20,
      'parameters': {'rtus': 'D03', 'filter': -2, 'auto': true}
    },*/
    {
      'type': 'modules/bus',
      'displayTime': 5,
      'parameters': {'stops': [
        {'Agency': 'DC Circulator',
          'StopID': '0136'},
        {'Agency': 'ART',
          'StopID': '61002'},
        {'Agency': 'Metrobus',
          'StopID': '6000882'},
        {'Agency': 'Metrobus',
          'StopID': '6000824'},
        {'Agency': 'Metrobus',
          'StopID': '6000818'},
        {'Agency': 'Metrobus',
          'StopID': '6000827'}
      ],
      'filter': 1}
    },
    {
      'type': 'modules/bus',
      'displayTime': 20,
      'parameters': {'stops': [
        {'Agency': 'Metrobus',
          'StopID': '2000172'}
      ],
      'filter': 1,
      'title': 'Silver Spring buses'}
    },
    {
      'type': 'modules/bikeshare',
      'displayTime': 5,
      'parameters': {'system': 'Capital Bikeshare',
                     'stations': ['127', '128']}
    },
    /*{
      'type': 'Bikeshare',
      'displayTime': 15,
      'parameters': {'system': 'BIXI',
                     'stations': ['71']}
    },
    {
      'type': 'Bikeshare',
      'displayTime': 15,
      'parameters': {'system': 'B-cycle',
                     'stations': ['1934', '1897']}
    }*/
    
  ]
};
