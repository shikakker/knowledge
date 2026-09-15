import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { Autocomplete, Text, Flex } from "@contentful/f36-components";
import { css } from "emotion";

import { ResultType } from "./types";

const MAX_SEARCH_QUERY_LENGTH = 100;

const styles = {
  searchResults: css({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "pre",
  }),
  error: css({
    marginTop: "4px",
  }),
};

export const SearchBox = () => {
  const [results, setResults] = useState<ResultType[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const router = useRouter();

  const handleInputValueChange = async (value: string) => {
    const requestId = ++requestSequence.current;
    const normalizedValue = value.slice(0, MAX_SEARCH_QUERY_LENGTH);
    setQuery(normalizedValue);
    setError("");

    if (!normalizedValue.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: normalizedValue }),
      });

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const matches = (await response.json()) as ResultType[];
      if (requestId !== requestSequence.current) return;
      setResults(Array.isArray(matches) ? matches : []);
    } catch {
      if (requestId !== requestSequence.current) return;
      setResults([]);
      setError("Search is temporarily unavailable. Try again.");
    }
  };

  const handleSelectItem = (item: ResultType) => {
    void router.push(item.slug);
  };

  const renderResult = (result: ResultType) => {
    const getContent = (content: string) => {
      if (!content) return null;

      const normalizedContent = content.toLocaleLowerCase();
      const normalizedQuery = query.toLocaleLowerCase();
      const startIndex = normalizedContent.indexOf(normalizedQuery);
      if (startIndex < 0 || !normalizedQuery) return content;

      return [
        content.slice(0, startIndex),
        <b key={`${result.slug}-match`}>
          {content.slice(startIndex, startIndex + query.length)}
        </b>,
        content.slice(startIndex + query.length),
      ];
    };

    return (
      <Flex flexDirection="column" key={result.slug}>
        <Text
          fontSize="fontSizeM"
          lineHeight="lineHeightM"
          fontWeight="fontWeightDemiBold"
          className={styles.searchResults}
        >
          {result.title}
        </Text>
        <Text
          fontSize="fontSizeS"
          lineHeight="lineHeightS"
          className={styles.searchResults}
        >
          {getContent(result.content)}
        </Text>
      </Flex>
    );
  };

  return (
    <Flex flexDirection="column">
      <Autocomplete
        onSelectItem={handleSelectItem}
        items={results}
        itemToString={(item: ResultType) => item.title}
        onInputValueChange={handleInputValueChange}
        renderItem={renderResult}
        listWidth="full"
      />
      {error && (
        <Text className={styles.error} fontSize="fontSizeS">
          <span role="alert">{error}</span>
        </Text>
      )}
    </Flex>
  );
};
