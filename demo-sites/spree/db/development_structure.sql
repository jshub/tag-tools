CREATE TABLE "addresses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "firstname" varchar(255), "lastname" varchar(255), "address1" varchar(255), "address2" varchar(255), "city" varchar(255), "state_id" integer, "zipcode" varchar(255), "country_id" integer, "phone" varchar(255), "created_at" datetime, "updated_at" datetime, "state_name" varchar(255), "alternative_phone" varchar(255));
CREATE TABLE "assets" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "viewable_id" integer, "viewable_type" varchar(255), "attachment_content_type" varchar(255), "attachment_file_name" varchar(255), "attachment_size" integer, "position" integer, "type" varchar(255), "attachment_updated_at" datetime);
CREATE TABLE 'configurations' ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "created_at" datetime, "updated_at" datetime, "type" varchar(255));
CREATE TABLE "countries" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "iso_name" varchar(255), "iso" varchar(255), "name" varchar(255), "iso3" varchar(255), "numcode" integer);
CREATE TABLE "creditcard_txns" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "creditcard_payment_id" integer, "amount" decimal DEFAULT 0.0 NOT NULL, "txn_type" varchar(255), "response_code" varchar(255), "avs_response" text, "cvv_response" text, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "creditcards" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "order_id" integer, "number" text(255), "month" varchar(255), "year" varchar(255), "verification_value" text(255), "cc_type" varchar(255), "display_number" varchar(255), "first_name" varchar(255), "last_name" varchar(255), "created_at" datetime, "updated_at" datetime, "start_month" varchar(255), "start_year" varchar(255), "issue_number" varchar(255), "address_id" integer);
CREATE TABLE "gateway_configurations" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "gateway_id" integer, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "gateway_option_values" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "gateway_configuration_id" integer, "gateway_option_id" integer, "value" text, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "gateway_options" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "description" text, "gateway_id" integer, "textarea" boolean DEFAULT 'f', "created_at" datetime, "updated_at" datetime);
CREATE TABLE "gateways" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "clazz" varchar(255), "name" varchar(255), "description" text, "active" boolean, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "inventory_units" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "variant_id" integer, "order_id" integer, "state" varchar(255), "lock_version" integer DEFAULT 0, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "line_items" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "order_id" integer, "variant_id" integer, "quantity" integer NOT NULL, "price" decimal(8,2) NOT NULL, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "option_types" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100), "presentation" varchar(100), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "option_types_prototypes" ("prototype_id" integer, "option_type_id" integer);
CREATE TABLE "option_values" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "option_type_id" integer, "name" varchar(255), "position" integer, "presentation" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "option_values_variants" ("variant_id" integer, "option_value_id" integer);
CREATE TABLE "orders" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer, "number" varchar(15), "ship_amount" decimal DEFAULT 0.0 NOT NULL, "tax_amount" decimal DEFAULT 0.0 NOT NULL, "item_total" decimal DEFAULT 0.0 NOT NULL, "total" decimal DEFAULT 0.0 NOT NULL, "ip_address" varchar(255), "special_instructions" text, "created_at" datetime, "updated_at" datetime, "state" varchar(255), "checkout_complete" boolean, "token" varchar(255), "email" varchar(255), "bill_address_id" integer, "ship_address_id" integer);
CREATE TABLE "payments" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "order_id" integer, "created_at" datetime, "updated_at" datetime, "amount" decimal DEFAULT 0.0 NOT NULL, "creditcard_id" integer, "type" varchar(255));
CREATE TABLE "preferences" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "attribute" varchar(255) NOT NULL, "owner_id" integer NOT NULL, "owner_type" varchar(255) NOT NULL, "group_id" integer, "group_type" varchar(255), "value" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "product_option_types" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer, "option_type_id" integer, "position" integer, "created_at" datetime, "updated_at" datetime);
CREATE TABLE 'product_properties' ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer, "property_id" integer, "value" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "products" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255) DEFAULT '' NOT NULL, "description" text, "master_price" decimal, "created_at" datetime, "updated_at" datetime, "permalink" varchar(255), "available_on" datetime, "tax_category_id" integer, "shipping_category_id" integer, "deleted_at" datetime, "meta_description" varchar(255), "meta_keywords" varchar(255));
CREATE TABLE "products_taxons" ("product_id" integer, "taxon_id" integer);
CREATE TABLE "properties" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "presentation" varchar(255) NOT NULL, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "properties_prototypes" ("prototype_id" integer, "property_id" integer);
CREATE TABLE "prototypes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "roles" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255));
CREATE TABLE "roles_users" ("role_id" integer, "user_id" integer);
CREATE TABLE "schema_migrations" ("version" varchar(255) NOT NULL);
CREATE TABLE "shipments" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "order_id" integer, "shipping_method_id" integer, "tracking" varchar(255), "created_at" datetime, "updated_at" datetime, "number" varchar(255), "cost" decimal(8,2), "shipped_at" datetime, "address_id" integer);
CREATE TABLE "shipping_categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "shipping_methods" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "zone_id" integer, "shipping_calculator" varchar(255), "name" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "state_events" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "order_id" integer, "user_id" integer, "name" varchar(255), "created_at" datetime, "updated_at" datetime, "previous_state" varchar(255));
CREATE TABLE "states" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "abbr" varchar(255), "country_id" integer);
CREATE TABLE "tax_categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "description" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "tax_rates" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "zone_id" integer, "amount" decimal, "created_at" datetime, "updated_at" datetime, "tax_type" integer, "tax_category_id" integer);
CREATE TABLE "taxonomies" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255) NOT NULL, "created_at" datetime, "updated_at" datetime);
CREATE TABLE "taxons" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "taxonomy_id" integer NOT NULL, "parent_id" integer, "position" integer DEFAULT 0, "name" varchar(255) NOT NULL, "created_at" datetime, "updated_at" datetime, "permalink" varchar(255));
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar(255), "crypted_password" varchar(128) DEFAULT '' NOT NULL, "salt" varchar(128) DEFAULT '' NOT NULL, "remember_token" varchar(255), "remember_token_expires_at" varchar(255), "created_at" datetime, "updated_at" datetime, "persistence_token" varchar(255), "single_access_token" varchar(255), "perishable_token" varchar(255), "login_count" integer DEFAULT 0 NOT NULL, "failed_login_count" integer DEFAULT 0 NOT NULL, "last_request_at" datetime, "current_login_at" datetime, "last_login_at" datetime, "current_login_ip" varchar(255), "last_login_ip" varchar(255), "login" varchar(255));
CREATE TABLE "variants" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer, "sku" varchar(255) DEFAULT '' NOT NULL, "price" decimal(8,2) NOT NULL, "weight" decimal(8,2), "height" decimal(8,2), "width" decimal(8,2), "depth" decimal(8,2), "deleted_at" datetime);
CREATE TABLE "zone_members" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "zone_id" integer, "zoneable_id" integer, "zoneable_type" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE TABLE "zones" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255), "description" varchar(255), "created_at" datetime, "updated_at" datetime);
CREATE INDEX "index_configurations_on_name_and_type" ON "configurations" ("name", "type");
CREATE INDEX "index_creditcards_on_order_id" ON "creditcards" ("order_id");
CREATE INDEX "index_line_items_on_order_id" ON "line_items" ("order_id");
CREATE INDEX "index_line_items_on_variant_id" ON "line_items" ("variant_id");
CREATE INDEX "index_option_values_variants_on_variant_id" ON "option_values_variants" ("variant_id");
CREATE INDEX "index_orders_on_checkout_complete" ON "orders" ("checkout_complete");
CREATE INDEX "index_orders_on_number" ON "orders" ("number");
CREATE UNIQUE INDEX "index_preferences_on_owner_and_attribute_and_preference" ON "preferences" ("owner_id", "owner_type", "attribute", "group_id", "group_type");
CREATE INDEX "index_products_on_available_on" ON "products" ("available_on");
CREATE INDEX "index_products_on_deleted_at" ON "products" ("deleted_at");
CREATE INDEX "index_products_on_name" ON "products" ("name");
CREATE INDEX "index_products_on_permalink" ON "products" ("permalink");
CREATE INDEX "index_products_taxons_on_product_id" ON "products_taxons" ("product_id");
CREATE INDEX "index_products_taxons_on_taxon_id" ON "products_taxons" ("taxon_id");
CREATE INDEX "index_roles_users_on_role_id" ON "roles_users" ("role_id");
CREATE INDEX "index_roles_users_on_user_id" ON "roles_users" ("user_id");
CREATE INDEX "index_variants_on_product_id" ON "variants" ("product_id");
CREATE UNIQUE INDEX "unique_schema_migrations" ON "schema_migrations" ("version");
INSERT INTO schema_migrations (version) VALUES ('1');

INSERT INTO schema_migrations (version) VALUES ('2');

INSERT INTO schema_migrations (version) VALUES ('3');

INSERT INTO schema_migrations (version) VALUES ('4');

INSERT INTO schema_migrations (version) VALUES ('5');

INSERT INTO schema_migrations (version) VALUES ('6');

INSERT INTO schema_migrations (version) VALUES ('7');

INSERT INTO schema_migrations (version) VALUES ('8');

INSERT INTO schema_migrations (version) VALUES ('9');

INSERT INTO schema_migrations (version) VALUES ('10');

INSERT INTO schema_migrations (version) VALUES ('11');

INSERT INTO schema_migrations (version) VALUES ('12');

INSERT INTO schema_migrations (version) VALUES ('13');

INSERT INTO schema_migrations (version) VALUES ('14');

INSERT INTO schema_migrations (version) VALUES ('15');

INSERT INTO schema_migrations (version) VALUES ('16');

INSERT INTO schema_migrations (version) VALUES ('17');

INSERT INTO schema_migrations (version) VALUES ('18');

INSERT INTO schema_migrations (version) VALUES ('19');

INSERT INTO schema_migrations (version) VALUES ('20');

INSERT INTO schema_migrations (version) VALUES ('21');

INSERT INTO schema_migrations (version) VALUES ('22');

INSERT INTO schema_migrations (version) VALUES ('23');

INSERT INTO schema_migrations (version) VALUES ('24');

INSERT INTO schema_migrations (version) VALUES ('25');

INSERT INTO schema_migrations (version) VALUES ('26');

INSERT INTO schema_migrations (version) VALUES ('20080620113300');

INSERT INTO schema_migrations (version) VALUES ('20080620113400');

INSERT INTO schema_migrations (version) VALUES ('20080622173128');

INSERT INTO schema_migrations (version) VALUES ('20080622194800');

INSERT INTO schema_migrations (version) VALUES ('20080622194830');

INSERT INTO schema_migrations (version) VALUES ('20080622195000');

INSERT INTO schema_migrations (version) VALUES ('20080622195100');

INSERT INTO schema_migrations (version) VALUES ('20080630003326');

INSERT INTO schema_migrations (version) VALUES ('20080630150630');

INSERT INTO schema_migrations (version) VALUES ('20080630152702');

INSERT INTO schema_migrations (version) VALUES ('20080630154400');

INSERT INTO schema_migrations (version) VALUES ('20080630215310');

INSERT INTO schema_migrations (version) VALUES ('20080703184654');

INSERT INTO schema_migrations (version) VALUES ('20080704181428');

INSERT INTO schema_migrations (version) VALUES ('20080704190355');

INSERT INTO schema_migrations (version) VALUES ('20080707002329');

INSERT INTO schema_migrations (version) VALUES ('20080708170103');

INSERT INTO schema_migrations (version) VALUES ('20080715014028');

INSERT INTO schema_migrations (version) VALUES ('20080716155613');

INSERT INTO schema_migrations (version) VALUES ('20080720190623');

INSERT INTO schema_migrations (version) VALUES ('20080729213052');

INSERT INTO schema_migrations (version) VALUES ('20080803010846');

INSERT INTO schema_migrations (version) VALUES ('20080807214829');

INSERT INTO schema_migrations (version) VALUES ('20080815173251');

INSERT INTO schema_migrations (version) VALUES ('20080830173354');

INSERT INTO schema_migrations (version) VALUES ('20080901002711');

INSERT INTO schema_migrations (version) VALUES ('20080902001408');

INSERT INTO schema_migrations (version) VALUES ('20080904150723');

INSERT INTO schema_migrations (version) VALUES ('20080904234457');

INSERT INTO schema_migrations (version) VALUES ('20080905012833');

INSERT INTO schema_migrations (version) VALUES ('20080906174748');

INSERT INTO schema_migrations (version) VALUES ('20080909100504');

INSERT INTO schema_migrations (version) VALUES ('20080915211650');

INSERT INTO schema_migrations (version) VALUES ('20080918083321');

INSERT INTO schema_migrations (version) VALUES ('20080918140438');

INSERT INTO schema_migrations (version) VALUES ('20081003211336');

INSERT INTO schema_migrations (version) VALUES ('20081003233427');

INSERT INTO schema_migrations (version) VALUES ('20081015001711');

INSERT INTO schema_migrations (version) VALUES ('20081016002224');

INSERT INTO schema_migrations (version) VALUES ('20081016162924');

INSERT INTO schema_migrations (version) VALUES ('20081018125019');

INSERT INTO schema_migrations (version) VALUES ('20081023134446');

INSERT INTO schema_migrations (version) VALUES ('20081120184215');

INSERT INTO schema_migrations (version) VALUES ('20081121192045');

INSERT INTO schema_migrations (version) VALUES ('20081205155619');

INSERT INTO schema_migrations (version) VALUES ('20081208143817');

INSERT INTO schema_migrations (version) VALUES ('20081208150007');

INSERT INTO schema_migrations (version) VALUES ('20081209103127');

INSERT INTO schema_migrations (version) VALUES ('20081212015915');

INSERT INTO schema_migrations (version) VALUES ('20081219091142');

INSERT INTO schema_migrations (version) VALUES ('20081221201510');

INSERT INTO schema_migrations (version) VALUES ('20090105152846');

INSERT INTO schema_migrations (version) VALUES ('20090204200045');

INSERT INTO schema_migrations (version) VALUES ('20090225231119');

INSERT INTO schema_migrations (version) VALUES ('20090302221152');

INSERT INTO schema_migrations (version) VALUES ('20090320113300');

INSERT INTO schema_migrations (version) VALUES ('20090324164010');

INSERT INTO schema_migrations (version) VALUES ('20090401120636');

INSERT INTO schema_migrations (version) VALUES ('20090401203712');

INSERT INTO schema_migrations (version) VALUES ('20090401223217');

INSERT INTO schema_migrations (version) VALUES ('20090402002244');

INSERT INTO schema_migrations (version) VALUES ('20090402161055');

INSERT INTO schema_migrations (version) VALUES ('20090402200317');

INSERT INTO schema_migrations (version) VALUES ('20090404192723');

INSERT INTO schema_migrations (version) VALUES ('20090406091357');

INSERT INTO schema_migrations (version) VALUES ('20090406174645');

INSERT INTO schema_migrations (version) VALUES ('20090420021303');

INSERT INTO schema_migrations (version) VALUES ('20090427000000');

INSERT INTO schema_migrations (version) VALUES ('20090525000325');

INSERT INTO schema_migrations (version) VALUES ('20080620100001');

INSERT INTO schema_migrations (version) VALUES ('20080704192456');

INSERT INTO schema_migrations (version) VALUES ('20080620120002');

INSERT INTO schema_migrations (version) VALUES ('20080620120003');

INSERT INTO schema_migrations (version) VALUES ('20080620120004');

INSERT INTO schema_migrations (version) VALUES ('20080620120005');

INSERT INTO schema_migrations (version) VALUES ('20080620120006');

INSERT INTO schema_migrations (version) VALUES ('20080620120007');

INSERT INTO schema_migrations (version) VALUES ('20080703120008');

INSERT INTO schema_migrations (version) VALUES ('20081119210419');

INSERT INTO schema_migrations (version) VALUES ('20081120144549');

INSERT INTO schema_migrations (version) VALUES ('20090218091936');

INSERT INTO schema_migrations (version) VALUES ('20090517173727');