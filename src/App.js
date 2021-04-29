import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import {sortData} from "./util";
import LineGraph from "./LineGraph";
import numeral from "numeral"; 
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  //useEffect runs a piece of code based on a given condition  
  // async sends a request, wait for it, do something   
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });

  }, []);


  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,  //UnitedStates , India
              value: country.countryInfo.iso2 //UK,USA
            }
          ));

          const sortedData = sortData(data); 
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    const newUrl = "https://disease.sh/v3/covid-19/countries/" + countryCode;
    const url =
      countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : newUrl;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });

  };


  return (
    <div className="app">
      <div className="app__left">

        <div className="app__header">
          <h1>COVID 19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select onChange={onCountryChange} variant="outlined" value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (<MenuItem value={country.value}>{country.name}</MenuItem>))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox onClick={e => setCasesType('cases')} title="Coronavirus Cases" cases={"+" + numeral(countryInfo.todayCases).format("0 a")} total={"+" + numeral(countryInfo.cases).format("0.0a")} />
          <InfoBox  onClick={e => setCasesType('recovered')} title="Recovered" cases={"+" + numeral(countryInfo.todayRecovered).format("0 a")} total={"+" + numeral(countryInfo.recovered).format("0.0a")} />
          <InfoBox  onClick={e => setCasesType('deaths')} title="Deaths" cases={"+" + numeral(countryInfo.todayDeaths).format("0 a")} total={"+" + numeral(countryInfo.deaths).format("0.0a")} />
        </div>

        <Map 
          casesType ={casesType}
          countries = {mapCountries}
          center = {mapCenter}
          zoom = {mapZoom}
        />

      </div>



      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
