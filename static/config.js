var config = {
  'weather_id': 'KDCA',
  'modules': [
    {
      'type': 'Metrorail',
      'displayTime': 20,
      'parameters': {'rtus': ['C05'], 'filter': -2}
    },
    /*{
      'type': 'Metrorail',
      'displayTime': 20,
      'parameters': {'rtus': 'D03', 'filter': -2, 'auto': true}
    },*/
    {
      'type': 'Bus',
      'displayTime': 20,
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
    /*{
      'type': 'Bus',
      'displayTime': 20,
      'parameters': {'stops': [
        {'Agency': 'Metrobus',
          'StopID': '2000172'}
      ],
      'filter': 1,
      'title': 'Silver Spring buses'}
    },*/
    {
      'type': 'Bikeshare',
      'displayTime': 15,
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
