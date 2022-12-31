import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import * as keys from './keys';

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [isLoadingNWSLatLong, setIsLoadingNWSLatLong] = useState(true);
  const [latLongNWSMainData, setLatLongNWSMainData] = useState<any>([]);
  const [latLongNWSMainError, setLatLongNWSMainError] = useState<string>('');

  const [isLoadingNWSForecast, setIsLoadingNWSForecast] = useState(true);
  const [foreCastNWSData, setForeCastNWSData] = useState<any>([]);
  const [foreCastNWSError, setForeCastNWSError] = useState<string>('');

  const [openWeatherIsLoading, setOpenWeatherIsLoading] = useState(true);
  const [openWeatherMainData, setOpenWeatherMainData] = useState<any>([]);
  const [openWeatherMainForecastError, setOpenWeatherMainForecastError] =
    useState<string>('');

  const [tomorrowIsLoading, setTomorrowIsLoading] = useState(true);
  const [tomorrow5dForecastData, setTomorrow5dForecastData] = useState<any>([]);
  const [tomorrowForecastError, setTomorrowForecastError] =
    useState<string>('');

  useEffect(() => {
    /***** NWS API (weather.gov) */
    const getNWSLatLongBasedData = (lat: number, long: number) => {
      let NWSError: Error | null = null;
      fetch(`https://api.weather.gov/points/${lat},${long}`)
        .then(response => {
          if (!response.ok) {
            const message: string = response.statusText
              ? response.statusText
              : response.detail
              ? response.detail
              : 'No Error message from NWS Lat Long request';

            setLatLongNWSMainError(message);

            throw Error(message);
          }
          return response.json();
        })
        .then(json => {
          setLatLongNWSMainData([{...json}]);
          return json;
        })
        .then(json => {
          if (json.properties && json.properties.forecast) {
            getNWSForecast(json.properties.forecast);
          } else {
            throw Error('No valid URL for NWS Forecast');
          }
        })
        .catch(error => {
          NWSError = error;
          console.error(error);
        })
        .finally(() => {
          setIsLoadingNWSLatLong(false);
        });

      return NWSError;
    };

    const getNWSForecast = (url: string) => {
      fetch(url)
        .then(response => {
          // console.log('OK check: ', response.ok);
          if (!response.ok) {
            const message: string = response.statusText
              ? response.statusText
              : response.detail
              ? response.detail
              : `${response.status}: No Error message from NWS Forecast request!`;

            setForeCastNWSError(message);

            throw Error(message);
          }
          return response.json();
        })
        .then(json => {
          setForeCastNWSData([{...json}]);
        })
        .catch(error => {
          console.error(error, error.stack);
        })
        .finally(() => {
          setIsLoadingNWSForecast(false);
        });
    };

    /***** OPEN WEATHER API */
    const getOpenWeatherOneCallData = () => {
      const tempAPIKey = keys.openWeatherAPIKey;
      fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=47.7384&lon=-121.0912&appid=${tempAPIKey}`,
      )
        .then(response => {
          if (!response.ok) {
            const message: string = response.statusText
              ? response.statusText
              : response.detail
              ? response.detail
              : 'No Error message from Open Weather One Call request';

            setOpenWeatherMainForecastError(message);
            throw Error(message);
          }
          return response.json();
        })
        .then(json => {
          setOpenWeatherMainData([{...json}]);
          return json;
        })
        .catch(error => console.error(error))
        .finally(() => setOpenWeatherIsLoading(false));
    };

    /***** Tomorrow.io */
    const getTomorrowIOForecastData = (lat: number, long: number) => {
      const tempAPIKey = keys.tomorrowAPIKey;
      // TODO: move callData outside for future options/cfg setup
      const callData = {
        latitude: lat,
        longitude: long,
        fields: [
          'temperature',
          'precipitationIntensity',
          'precipitationType',
          'windSpeed',
          'windGust',
          'windDirection',
          'temperature',
          'temperatureApparent',
          'cloudCover',
          'cloudBase',
          'cloudCeiling',
          'weatherCode',
        ],
        units: 'imperial',
        timeSteps: '1d',
        startTime: 'now',
        endTime: 'nowPlus5d',
        apiKey: tempAPIKey,
      };

      const {
        latitude,
        longitude,
        fields,
        units,
        timeSteps,
        startTime,
        endTime,
        apiKey,
      } = callData;

      const fieldsCreator = fields.reduce(
        (prevVal: string, field: string) => prevVal + `&fields=${field}`,
      );

      const url: string = `https://api.tomorrow.io/v4/timelines?location=${latitude}%2C%20${longitude}&fields=${fieldsCreator}&units=${units}&timesteps=${timeSteps}&startTime=${startTime}&endTime=${endTime}&apikey=${apiKey}`;

      // const urlTest: string = `https://api.tomorrow.io/v4/timelines?location=${latitude}%2C%20${longitude}&fields=temperature&fields=precipitationType&fields=precipitationIntensity&units=${units}&timesteps=${timeSteps}&startTime=${startTime}&endTime=${endTime}&apikey=${apiKey}"`;

      // const works =
      //   'https://api.tomorrow.io/v4/timelines?location=47.7384%2C%20-121.0912&fields=temperature&fields=precipitationType&fields=precipitationIntensity&units=imperial&timesteps=1d&startTime=now&endTime=nowPlus5d&apikey=lZyi4GrWbha18uknU8LWq4Ay4EVoQx73';

      fetch(url)
        .then(response => {
          // console.log({TomorrowResponse: response});

          if (!response.ok) {
            const message: string = response.statusText
              ? response.statusText
              : response.detail
              ? response.detail
              : 'No Error message from Tomorrow Forecast request';

            setTomorrowForecastError(message);
            throw Error(message);
          }
          return response.json();
        })
        .then(json => {
          // console.log({tomorrowJSON: json.data.timelines[0].intervals});
          setTomorrow5dForecastData([...json.data.timelines]);
          return json;
        })
        .catch(error => console.error(error))
        .finally(() => setTomorrowIsLoading(false));
    };

    /***** API Calls */
    const lat: number = 47.7384;
    const long: number = -121.0912;
    const NWSError = getNWSLatLongBasedData(lat, long);

    // make alternate API calls if NWS fails
    if (!NWSError) {
      getOpenWeatherOneCallData();
      getTomorrowIOForecastData(lat, long);
    }
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  let cityNWS = 'NO CITY DATA';
  let timeNWS = 'NO TIME DATA';
  let elevationNWS = 'NO ELEVATION DATA';
  let periodsNWS = [];

  if (latLongNWSMainData.length && !latLongNWSMainError) {
    cityNWS = `${latLongNWSMainData[0].properties.relativeLocation.properties.city}`;
  }

  if (foreCastNWSData.length && !foreCastNWSError) {
    const {generatedAt, elevation, periods} = foreCastNWSData[0].properties;
    timeNWS = `${generatedAt}`;

    elevationNWS = `${elevation.value} feet`;

    periodsNWS = periods;
  }

  const openWeatherAlert: string =
    openWeatherMainData.length && openWeatherMainData[0].alerts
      ? openWeatherMainData[0].alerts[0].description
      : 'No Alerts';

  const openWeatherAlertWhat: string =
    openWeatherMainData.length && openWeatherMainData[0].alerts
      ? openWeatherMainData[0].alerts[0].description.indexOf('* WHAT')
      : '';

  const openWeatherAlertWhere: string =
    openWeatherMainData.length && openWeatherMainData[0].alerts
      ? openWeatherMainData[0].alerts[0].description.indexOf('* WHERE')
      : '';

  const tomorrowIntervals: any = tomorrow5dForecastData.length
    ? tomorrow5dForecastData[0].intervals
    : [];

  // console.log({tomorrowIntervals});

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{flexGrow: 1}}
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            flex: 1,
          }}>
          <Section title="NWS - City">
            <Text>{isLoadingNWSLatLong ? 'Loading...' : cityNWS}</Text>
          </Section>
          <Section title="NWS - 14 Day Forecast">
            {isLoadingNWSForecast ? (
              <Text>Loading...</Text>
            ) : !foreCastNWSError ? (
              <>
                <Text>Time: {timeNWS}</Text>
                {'\n'}
                <Text>Elevation: {elevationNWS}</Text>
                {'\n'}

                {periodsNWS.map((period: any) => {
                  return (
                    <React.Fragment key={period.number}>
                      <Text>{period.name}:</Text>
                      {'\n'}
                      <Text>{period.shortForecast}</Text>
                      {'\n'}
                      <Text>Temperature: {period.temperature} F</Text>
                      {'\n'}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <Text>{foreCastNWSError}</Text>
            )}
          </Section>
          {!foreCastNWSData ? (
            <>
              <Section title="Open Weather Alerts">
                {openWeatherMainForecastError ? (
                  openWeatherMainForecastError
                ) : openWeatherIsLoading ? (
                  'Loading...'
                ) : (
                  <>
                    {/* <Text style={{flex: 1}}>{openWeatherAlert}</Text> */}
                    {'\n'}

                    <Text>What: {openWeatherAlertWhat}</Text>
                    {'\n'}

                    <Text>Where: {openWeatherAlertWhere}</Text>
                  </>
                )}
              </Section>
              <Section title="Tomorrow.io 5 Day Forecast">
                {tomorrowForecastError ? (
                  tomorrowForecastError
                ) : tomorrowIsLoading ? (
                  'Loading...'
                ) : (
                  <>
                    {tomorrowIntervals.map((interval: any) => {
                      const startTime = interval.startTime;
                      const values = interval.values;

                      return (
                        <React.Fragment key={startTime}>
                          <Text>Time: {startTime}</Text>
                          {'\n'}
                          {Object.keys(values).map(key => (
                            <React.Fragment key={key}>
                              <Text>{key}</Text>
                              {'\n'}
                            </React.Fragment>
                          ))}
                          {'\n'}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </Section>
            </>
          ) : (
            ''
          )}

          {/* <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
