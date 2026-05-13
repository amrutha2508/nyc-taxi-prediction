import pandas as pd
import numpy as np

def extract_dataset_info(year: int, month: int):
    url = f'https://d37ci6vzurychx.cloudfront.net/trip-data/green_tripdata_{year}-{month:02d}.parquet'
    
    try:
        df = pd.read_parquet(url)
        
        # 1. Calculate duration
        duration_series = (df['lpep_dropoff_datetime'] - df['lpep_pickup_datetime']).dt.total_seconds() / 60
        df['trip_duration_mins'] = duration_series # Add to df for the describe() call below
        
        # 2. Basic Stats
        avg_dist = df['trip_distance'].mean()
        avg_dur = duration_series.mean()
        
        # 3. Outlier detection
        dur_std = duration_series.std()
        duration_outliers_mask = np.abs(duration_series - avg_dur) > (3 * dur_std)
        outlier_percentage = (duration_outliers_mask.sum() / len(df)) * 100

        # 4. Generate Metadata (Descriptive Statistics)
        # Numerical: Includes mean, std, min, max, quartiles
        num_stats_df = df.describe().replace([np.inf, -np.inf], np.nan).fillna(0)
    
        # Convert to dict
        num_stats = num_stats_df.to_dict()
        
        # Do the same for categorical if needed
        cat_stats = df.select_dtypes(include=['object', 'category']).describe().fillna("N/A").to_dict()

        stats = {
            "rows": len(df),
            "avg_distance": float(avg_dist),
            "avg_duration": float(avg_dur),
            "outliers": float(outlier_percentage),
            "url": url,
            "metadata": {
                "numerical_stats": num_stats,
                "categorical_stats": cat_stats
            }
        }
        return stats
        
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None