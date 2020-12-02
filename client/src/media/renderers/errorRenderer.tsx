import React from "react";

export default function ErrorRenderer(message: string) {
  return () => {
    return <div>{message}</div>;
  };
}
