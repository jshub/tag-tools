class CreateTestrunnerResults < ActiveRecord::Migration
  def self.up
    create_table :testrunner_results do |t|
      t.column :action, :string
      t.column :request, :string
      t.column :start_time, :datetime
      t.column :end_time, :datetime
      t.column :total, :float
    end
  end

  def self.down
    drop_table :testrunner_results
  end
end
 