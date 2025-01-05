import {useState, useEffect} from 'react'
const useAppWrite = (fn) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fn();
        setData(response);
      } catch (error) {
        Alert.alert('Error', error.message)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fn])

  const refetch = async () => await fetchData();

  return {data, refetch};
}

export default useAppWrite;