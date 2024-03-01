import { useState } from "react";
import { f } from "./f.hook";

export enum LoadedFunctionStatus {
  Waiting = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export interface IUseLoaderResult<
  T extends (...args: any) => any,
  K = Awaited<ReturnType<T>> | null
> {
  invoke: (...args: Parameters<T>) => Promise<K>;
  status: LoadedFunctionStatus;
  isSuccess: boolean;
  isError: boolean;
  isWaiting: boolean;
  isLoading: boolean;
  error?: unknown;
  data?: K;
}

interface LoaderOptionsParam {
  resetOnFocus?: boolean;
}

export function useLoader<T extends (...args: any) => Promise<any>>(
  loadable: T,
  deps: unknown[] = [],
  options?: LoaderOptionsParam
) {
  const [state, setState] = useState<
    Pick<IUseLoaderResult<T>, "status" | "error" | "data">
  >({
    status: LoadedFunctionStatus.Waiting,
    error: undefined,
    data: undefined,
  });

  const invoke = f(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
      let result: Awaited<ReturnType<T>> | null = null;

      try {
        setState({
          ...state,
          status: LoadedFunctionStatus.Loading,
          error: undefined,
          data: undefined,
        });
        // @ts-ignore
        result = await loadable(...args);
        setState({
          ...state,
          status: LoadedFunctionStatus.Success,
          data: result,
        });
      } catch (error: unknown) {
        setState({ ...state, status: LoadedFunctionStatus.Error, error });
      } finally {
        // setState({ ...state, status: LoadedFunctionStatus.Waiting });
      }

      return result;
    },
    [...deps]
  );

  const { status, error } = state;
  const result: IUseLoaderResult<T> = {
    invoke,
    status: status,
    isSuccess: status === LoadedFunctionStatus.Success,
    isError: status === LoadedFunctionStatus.Error,
    isWaiting: status === LoadedFunctionStatus.Waiting,
    isLoading: status === LoadedFunctionStatus.Loading,
    error,
    data: state.data,
  };

  return result;
}
