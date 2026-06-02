from app.models.site_configuration import SiteConfiguration

def get_public_config(db):
    configs = db.query(SiteConfiguration).all()
    result = {}
    for config in configs:
        result[config.config_key] = config.config_value
    return result

