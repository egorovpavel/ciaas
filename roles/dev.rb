# Name of the role should match the name of the file
name "dev"

# Run list function we mentioned earlier
run_list(
    "recipe[nodejs]",
    "recipe[docker]",
    "recipe[mysql::server]",
    "recipe[redisio::install]",
    "recipe[redisio::enable]",
    "recipe[ciaas]",
)

override_attributes "mysql" => {
	"server_root_password" => "root"
}