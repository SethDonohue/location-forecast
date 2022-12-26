/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

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

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>([]);
  const [openWeatherMainData, setOpenWeatherMainData] = useState<any>([]);
  const [hourlyForeCastData, setHourlyForeCastData] = useState<any>([]);

  const [hourlyError, setHourlyError] = useState<string>('');
  const [mainForecastError, setMainForecastError] = useState<string>('');
  const [openWeatherMainForecastError, setOpenWeatherMainForecastError] =
    useState<string>('');

  useEffect(() => {
    const getNWSLatLongBasedData = () => {
      fetch('https://api.weather.gov/points/47.7384,-121.0912')
        .then(response => response.json())
        .then(json => {
          if (json && json.status === 503) {
            setMainForecastError(
              'Main NWS Service Unavailable at this time. Please try again shortly.',
            );
            throw 'Main NWS Service Unavailable at this time. Please try again shortly.';
          } else {
            console.log('DATA JSON: ', json);
            console.log(json.properties.relativeLocation.properties.city);
            setData(json);
          }
          return json;
        })
        .then(json => {
          const url = json.properties.forecastHourly;
          getLatLongHourlyForecast(url);
        })
        .catch(error => console.error(error))
        .finally(() => setIsLoading(false));
    };

    const getOpenWeatherLatLongCurrentData = () => {
      const tempAPIKey = '8c56de359ba99481b988e9a6f4ea8223';
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=47.7384&lon=-121.0912&appid=${tempAPIKey}`,
      )
        .then(response => response.json())
        .then(json => {
          if (json && json.status === 503) {
            setOpenWeatherMainForecastError(
              'Main Open Weather Service Unavailable at this time. Please try again shortly.',
            );
            throw 'Main Open Weather Service Unavailable at this time. Please try again shortly.';
          } else {
            console.log('Open Weather JSON: ', json);
            setOpenWeatherMainData(json);
          }
          // return json;
        })
        // .then(json => {
        //   const url = json.properties.forecastHourly;
        //   getLatLongHourlyForecast(url);
        // })
        .catch(error => console.error(error))
        .finally(() => setIsLoading(false));
    };

    const getOpenWeatherOneCallData = () => {
      const tempAPIKey = '8c56de359ba99481b988e9a6f4ea8223';
      fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=47.7384&lon=-121.0912&appid=${tempAPIKey}`,
      )
        .then(response => response.json())
        .then(json => {
          if (json && json.status === 503) {
            setOpenWeatherMainForecastError(
              'Main Open Weather Service Unavailable at this time. Please try again shortly.',
            );
            throw 'Main Open Weather Service Unavailable at this time. Please try again shortly.';
          } else {
            console.log('Open Weather ONE CALL: ', json);
            setOpenWeatherMainData(json);
          }
          // return json;
        })
        // .then(json => {
        //   const url = json.properties.forecastHourly;
        //   getLatLongHourlyForecast(url);
        // })
        .catch(error => console.error(error))
        .finally(() => setIsLoading(false));
    };

    const getLatLongHourlyForecast = (url: string) => {
      fetch(url)
        .then(response => response.json())
        .then(json => {
          console.log('hourly json: ', json);
          if (json && json.status === 503) {
            setHourlyError(
              '503: Hourly Service Unavailable at this time. Please try again shortly.',
            );
            throw 'Hourly Service Unavailable at this time. Please try again shortly.';
          } else {
            setHourlyForeCastData(prevData => {
              // TODO: remove prevData callback?
              return json;
            });
          }
        })
        .catch(error => console.error(error))
        .finally(() => setIsLoading(false));
    };

    // getNWSLatLongBasedData();
    getOpenWeatherLatLongCurrentData();
    getOpenWeatherOneCallData();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const time: string =
    !hourlyError && hourlyForeCastData.properties
      ? `${hourlyForeCastData.properties.generatedAt}`
      : 'NO TIME DATA';

  const elevation: string =
    !hourlyError && hourlyForeCastData.properties
      ? `${hourlyForeCastData[0].properties.elevation.value}`
      : 'NO ELEVATION DATA';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="City">
            <Text>
              {data.properties
                ? `${data.properties.relativeLocation.properties.city}`
                : 'NO CITY DATA'}
            </Text>
          </Section>
          <Section title="Forecast Hourly">
            {hourlyError ? (
              <Text>{hourlyError}</Text>
            ) : (
              <>
                <Text>Time: {time}</Text>
                {'\n'}
                <Text>Elevation: {elevation}</Text>
              </>
            )}
          </Section>
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
