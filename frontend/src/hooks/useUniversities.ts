"use client";

import { useState, useEffect } from "react";
import { UNIVERSITIES, type University } from "@/data/universities";
import { fetchUniversities } from "@/lib/universities-api";

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>(UNIVERSITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities()
      .then(setUniversities)
      .finally(() => setLoading(false));
  }, []);

  return { universities, loading };
}
