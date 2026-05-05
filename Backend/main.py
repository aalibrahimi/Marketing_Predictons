import os
from flask import Flask, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import kagglehub
import pandas as pd
# from rich.traceback import install
# install()

load_dotenv()

app = Flask(__name__)
# CORS is needed for communication between frontend and backend
CORS(app)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

kagglehub.dataset_download("rabieelkharoua/predict-conversion-in-digital-marketing-dataset", output_dir="kaggle_download")
csv_df = pd.read_csv("kaggle_download/digital_marketing_campaign_dataset.csv")


@app.route('/')
def index():
    print("Route got called")
    return "hello from backend 👋"


@app.route('/api/overview')
def overview():
    total = len(csv_df)
    converted = int(csv_df['Conversion'].sum())
    conversion_rate = round(csv_df['Conversion'].mean() * 100, 2)
    avg_ctr = round(csv_df['ClickThroughRate'].mean() * 100, 2)
    avg_ad_spend = round(csv_df['AdSpend'].mean(), 2)
    avg_time_on_site = round(csv_df['TimeOnSite'].mean(), 2)
    avg_pages = round(csv_df['PagesPerVisit'].mean(), 2)
    return jsonify({
        'total_customers': total,
        'total_conversions': converted,
        'conversion_rate': conversion_rate,
        'avg_ctr': avg_ctr,
        'avg_ad_spend': avg_ad_spend,
        'avg_time_on_site': avg_time_on_site,
        'avg_pages_per_visit': avg_pages,
    })


@app.route('/api/by-channel')
def by_channel():
    grouped = csv_df.groupby('CampaignChannel').agg(
        conversion_rate=('Conversion', lambda x: round(x.mean() * 100, 2)),
        avg_ctr=('ClickThroughRate', lambda x: round(x.mean() * 100, 2)),
        avg_ad_spend=('AdSpend', lambda x: round(x.mean(), 2)),
        total=('Conversion', 'count'),
        conversions=('Conversion', 'sum'),
    ).reset_index()
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/by-campaign-type')
def by_campaign_type():
    grouped = csv_df.groupby('CampaignType').agg(
        conversion_rate=('Conversion', lambda x: round(x.mean() * 100, 2)),
        avg_ctr=('ClickThroughRate', lambda x: round(x.mean() * 100, 2)),
        avg_ad_spend=('AdSpend', lambda x: round(x.mean(), 2)),
        total=('Conversion', 'count'),
        conversions=('Conversion', 'sum'),
    ).reset_index()
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/by-age')
def by_age():
    df = csv_df.copy()
    bins = [0, 25, 35, 45, 55, 100]
    labels = ['18-25', '26-35', '36-45', '46-55', '56+']
    df['age_group'] = pd.cut(df['Age'], bins=bins, labels=labels)
    grouped = df.groupby('age_group', observed=True).agg(
        conversion_rate=('Conversion', lambda x: round(x.mean() * 100, 2)),
        avg_ad_spend=('AdSpend', lambda x: round(x.mean(), 2)),
        total=('Conversion', 'count'),
        conversions=('Conversion', 'sum'),
    ).reset_index()
    grouped['age_group'] = grouped['age_group'].astype(str)
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/by-gender')
def by_gender():
    grouped = csv_df.groupby('Gender').agg(
        conversion_rate=('Conversion', lambda x: round(x.mean() * 100, 2)),
        total=('Conversion', 'count'),
        conversions=('Conversion', 'sum'),
    ).reset_index()
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/engagement')
def engagement():
    grouped = csv_df.groupby('CampaignChannel').agg(
        avg_ctr=('ClickThroughRate', lambda x: round(x.mean() * 100, 2)),
        avg_pages=('PagesPerVisit', lambda x: round(x.mean(), 2)),
        avg_time=('TimeOnSite', lambda x: round(x.mean(), 2)),
        avg_visits=('WebsiteVisits', lambda x: round(x.mean(), 2)),
        avg_social_shares=('SocialShares', lambda x: round(x.mean(), 2)),
    ).reset_index()
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/top-combinations')
def top_combinations():
    grouped = csv_df.groupby(['CampaignChannel', 'CampaignType']).agg(
        conversion_rate=('Conversion', lambda x: round(x.mean() * 100, 2)),
        avg_ad_spend=('AdSpend', lambda x: round(x.mean(), 2)),
        avg_ctr=('ClickThroughRate', lambda x: round(x.mean() * 100, 2)),
        total=('Conversion', 'count'),
    ).reset_index()
    top = grouped.nlargest(8, 'conversion_rate')
    return jsonify(top.to_dict(orient='records'))


if __name__ == '__main__':
    # This line is needed for Railway port assignment
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=port == 3001)
