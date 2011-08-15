var config = {
  'weather_id': 'KDCA',
  'modules': [
    {
      'type': 'Metrorail',
      'displayTime': 60,
      'parameters': {'rtu': 'C05'}
    },
    {
      'type': 'Bus',
      'displayTime': 30,
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
      ]}
    },
    {
      'type': 'CaBi',
      'displayTime': 30,
      'parameters': {'stations': ['127', '128']}
    }
  ]
};
