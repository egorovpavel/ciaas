# Name of the role should match the name of the file
name "dev"

# Run list function we mentioned earlier
run_list(
	"recipe[runit]",
    "recipe[nodejs]",
    "recipe[docker]",
    "recipe[mysql::server]",
    "recipe[redisio]",
    "recipe[redisio::enable]",
    "recipe[packer]",
    "recipe[ciaas]",
)

override_attributes "mysql" => {
	"server_root_password" => "root"
}