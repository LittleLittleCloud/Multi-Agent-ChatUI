import { IRecord } from "@/types/storage";

export class Provider<TModel extends IRecord, TProviderType>{
    private _providers: Record<string, TProviderType> = {};
    private _configUIProviders: Record<string, (model: TModel, onConfigChange?: (config: TModel) => void) => JSX.Element> = {};
    private _defaultValues: Record<string, TModel> = {};
    private _availableModels: string[] = [];

    registerProvider<T extends TModel>(
        id: string,
        provider: TProviderType,
        configUIProvider: (model: T, onConfigChange?: (config: T) => void) => JSX.Element,
        defaultConfig: TModel){
        if(!this._availableModels.includes(id)){
            this._availableModels.push(id);
        }

        this._providers[id] = provider;
        this._configUIProviders[id] = (config: TModel, onConfigChange?: (config: TModel) => void) => configUIProvider(config as T, onConfigChange as (config: T) => void);
        this._defaultValues[id] = defaultConfig;
    }

    getDefaultValue(type: string): TModel{
        if(!this._defaultValues[type]){
            throw new Error(`No default value for model ${type}`);
        }

        return this._defaultValues[type];
    }

    getConfigUIProvider(type: string): (model: TModel, onConfigChange?: (config: TModel) => void) => JSX.Element{
        if(!this.hasProvider(type)){
            throw new Error(`No provider for model ${type}`);
        }

        return this._configUIProviders[type];
    }

    getProvider<T extends TModel>(model: T): TProviderType{
        if(!this.hasProvider(model.type)){
            throw new Error(`No provider for model ${model.type}`);
        }

        return this._providers[model.type];
    }

    getAvailableModels(): string[]{
        return this._availableModels;
    }

    hasProvider(type: string): boolean{
        return this._availableModels.includes(type);
    }
}
