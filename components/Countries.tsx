"use client";

import React, { useState, useEffect } from "react";
import CountryItem from "./CountryItem";
import Link from "next/link";
import Loading from "./ui/loading";

interface Country {
  capital: string[];
  name: {
    common: string;
    nativeName: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
    official: string;
  };
  region: string;
  population: number;
  flags: {
    alt: string;
    png: string;
    svg: string;
  };
}

interface Props {
  searchTerm: string;
  region: string;
  page: number;
  pageSize: number;
  onTotalCountChange: (totalCount: number) => void;
}

export default function Countries(props: Props) {
  const [apiData, setApiData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  async function getData(): Promise<void> {
    console.log("called");
    try {
      const data: Country[] = await fetch(
        "https://restcountries.com/v3.1/independent?fields=name,population,region,capital,flags"
      ).then((res) => res.json());

      setApiData(data);
      props.onTotalCountChange(data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (apiData.length === 0) {
      getData();
    }
  }, [apiData.length]);

  const filterCountries = (
    data: Country[],
    searchTerm: string,
    regionSearch?: string
  ): Country[] => {
    let filteredData = data;

    if (regionSearch) {
      filteredData = filteredData.filter(
        (country) => country.region === regionSearch
      );
    }

    if (searchTerm) {
      filteredData = filteredData.filter((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(searchTerm);
      console.log(filteredData);
    }

    if (filteredData.length === 0) {
      return [];
    }

    return filteredData;
  };

  const paginatedCountries = (
    data: Country[],
    page: number,
    pageSize: number
  ): Country[] => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  useEffect(() => {
    const filteredData = filterCountries(
      apiData,
      props.searchTerm,
      props.region
    );
    props.onTotalCountChange(filteredData.length);
  }, [props.searchTerm, props.region, apiData, props.onTotalCountChange]);

  const filteredData = filterCountries(apiData, props.searchTerm, props.region);
  const paginatedData = paginatedCountries(
    filteredData,
    props.page,
    props.pageSize
  );

  return (
    <div className="mt-12 grid gap-8 md:gap-22 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        <Loading />
      ) : filteredData.length === 0 ? (
        "No matching Country"
      ) : (
        paginatedData.map((country, index) => (
          <Link key={index} href={`/detail/${country.name.common}`}>
            <CountryItem
              key={index}
              name={country.name.common}
              population={country.population}
              region={country.region}
              capital={country.capital}
              img={country.flags.png}
              imgAlt={country.flags.alt}
            />
          </Link>
        ))
      )}
    </div>
  );
}
