import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
import selenium.webdriver.support.ui as ui
from selenium.webdriver.common.keys import Keys

executable_path = "/usr/local/bin/chromedriver"
os.environ["webdriver.chrome.driver"] = executable_path

chrome_options = Options()
chrome_options.add_extension("./MetaMask_v4.1.3.crx")
chrome_options.add_argument("--start-maximized")

driver = webdriver.Chrome(executable_path=executable_path, chrome_options=chrome_options)

#seed_phrase = input("Enter seed phrase: ")
password = "qwertyuiop"
seed_phrase = "hybrid abuse wire harsh narrow remind cotton insane minor fabric robot illegal"
person1 = ["Dean", "Lynch", "lynchdean@gmail.com", "This is a biography"]

time.sleep(5)
driver.close()
driver.switch_to.window(driver.window_handles[0])

time.sleep(3)
driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/popup.html')
time.sleep(1)

# Accept Privacy Notice
accept_privacy = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/div[1]/button')
accept_privacy.click()

# Accept Terms of Use
end_of_notice = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/div[1]/div/div/p[55]/strong/a')
driver.execute_script("arguments[0].scrollIntoView();", end_of_notice)
accept_tou = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/div[1]/button')
accept_tou.click()

# Click Import Existing Den
import_den = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/div[3]/p')
import_den.click()

#Input seed phrase and password
seed_box = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/textarea')
seed_box.send_keys(seed_phrase)

input_password = driver.find_element_by_xpath('//*[@id="password-box"]')
input_password.send_keys(password)

input_confirm = driver.find_element_by_xpath('//*[@id="password-box-confirm"]')
input_confirm.send_keys(password)

confirm_restore = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[4]/div/div/button[2]')
confirm_restore.click()

# Change network to localhost 8545
select_network = driver.find_element_by_xpath('//*[@id="network_component"]/div/div[2]')
select_network.click()

time.sleep(0.2)
localhost_8545 = driver.find_element_by_xpath('//*[@id="app-content"]/div/div[2]/span/div/li[5]')
localhost_8545.click()

# Open welcome page
driver.get('localhost:3000')
open_registration = driver.find_element_by_xpath('//*[@id="welcome"]')
open_registration.click()

# Fill in registration details
time.sleep(2)
first_name = driver.find_element_by_xpath('//*[@id="firstnameInput"]')
first_name.send_keys(person1[0])

last_name = driver.find_element_by_xpath('//*[@id="surnameInput"]')
last_name.send_keys(person1[1])

email = driver.find_element_by_xpath('//*[@id="emailInput"]')
email.send_keys(person1[2])

biography = driver.find_element_by_xpath('//*[@id="biographyInput"]')
biography.send_keys(person1[3])

register_button = driver.find_element_by_xpath('//*[@id="registerButton"]')
register_button.click()

time.sleep(3)
driver.switch_to_window(driver.window_handles[-1])

time.sleep(3)
print(driver.title)

confirm_transaction = driver.find_element_by_xpath('//*[@id="pending-tx-form"]/div[3]/input')
confirm_transaction.click()

# -----------------------------------------------#
# Breaks here, can't handle the confirm dialogue #
# -----------------------------------------------#

time.sleep(5)
driver.switch_to.window(driver.window_handles[0])

driver.get('localhost:3000/accountList.html')
time.sleep(5)
x = driver.find_element_by_link_text(person1[0] + " " + person1[1])
x.click()

# Assertions

assert_first_name = driver.find_element_by_xpath('/html/body/div[1]/div[2]/div/h5[1]').get_attribute('innerHTML').split(" ")[2]
assert assert_first_name == person1[0], "First name incorrect"

assert_last_name = driver.find_element_by_xpath('/html/body/div[1]/div[2]/div/h5[2]').get_attribute('innerHTML').split(" ")[2]
assert assert_last_name == person1[1], "Last name incorrect"

assert_email = driver.find_element_by_xpath('/html/body/div[1]/div[2]/div/h5[3]').get_attribute('innerHTML').split(" ")[2]
assert assert_first_name == person1[2], "Email incorrect"

assert_biography = driver.find_element_by_xpath('/html/body/div[1]/div[2]/div/p').get_attribute('innerHTML')
assert assert_biography == person1[3], "Biography incorrect"

print("All assertions have passed!")
driver.quit()
